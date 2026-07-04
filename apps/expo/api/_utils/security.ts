/**
 * API Security Utilities
 *
 * Shared security middleware for Vercel serverless functions:
 * - CORS allowlist (no reflection of unknown origins)
 * - Durable rate limiting (Upstash Redis when configured, in-memory fallback)
 * - Request validation
 *
 * NOTE: CORS is a browser-only control and does not stop server-side abuse
 * (curl, scripts). Rate limiting is the real throttle protecting the paid
 * Gemini key. In-memory limiting is per-instance and resets on cold start,
 * so production MUST set UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN
 * for the limit to be effective across the horizontally-scaled runtime.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

// Allowed browser origins for CORS
const ALLOWED_ORIGINS = [
  'https://toonnotes.com',
  'https://www.toonnotes.com',
  'https://toonnotes-api.vercel.app',
  'https://expo-phi-ruddy.vercel.app',
  // Development origins
  'http://localhost:8081',
  'http://localhost:19006',
  'http://localhost:3000',
  // Expo Go origins
  'exp://localhost:8081',
];

// Rate limit configuration
const RATE_LIMIT = {
  maxRequests: 30, // requests per window
  windowMs: 60 * 1000, // 1 minute window
};

// In-memory fallback store (per-instance, resets on cold start).
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

// Upstash Redis REST configuration (optional but strongly recommended in prod)
const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const UPSTASH_ENABLED = Boolean(UPSTASH_URL && UPSTASH_TOKEN);

let warnedNoDurableLimiter = false;

/**
 * Get a best-effort client identifier for rate limiting.
 *
 * On Vercel the platform sets `x-real-ip` (the true edge-observed client IP,
 * not client-controlled). `x-forwarded-for` is client-spoofable, so we prefer
 * x-real-ip and only fall back to the LAST hop of XFF (added by the platform).
 */
function getClientId(req: VercelRequest): string {
  const realIp = req.headers['x-real-ip'];
  if (typeof realIp === 'string' && realIp.trim()) {
    return realIp.trim();
  }
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.trim()) {
    const parts = forwarded.split(',').map((p) => p.trim()).filter(Boolean);
    // Last entry is appended by the trusted proxy; least spoofable.
    if (parts.length > 0) return parts[parts.length - 1];
  }
  return 'unknown';
}

type RateResult = { allowed: boolean; remaining: number; resetIn: number };

/** In-memory fixed-window limiter (fallback). */
function checkRateLimitMemory(clientId: string): RateResult {
  const now = Date.now();
  const entry = rateLimitStore.get(clientId);

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(clientId, { count: 1, resetAt: now + RATE_LIMIT.windowMs });
    return { allowed: true, remaining: RATE_LIMIT.maxRequests - 1, resetIn: RATE_LIMIT.windowMs };
  }
  if (entry.count >= RATE_LIMIT.maxRequests) {
    return { allowed: false, remaining: 0, resetIn: entry.resetAt - now };
  }
  entry.count++;
  return { allowed: true, remaining: RATE_LIMIT.maxRequests - entry.count, resetIn: entry.resetAt - now };
}

/**
 * Durable fixed-window limiter backed by Upstash Redis REST.
 * Uses INCR + first-write EXPIRE. Falls back to in-memory on any error so a
 * transient Redis outage never takes the whole API down.
 */
async function checkRateLimitDurable(clientId: string): Promise<RateResult> {
  const windowSec = Math.floor(RATE_LIMIT.windowMs / 1000);
  const bucket = Math.floor(Date.now() / RATE_LIMIT.windowMs);
  const key = `rl:${clientId}:${bucket}`;
  try {
    // Pipeline: INCR then EXPIRE (idempotent; sets TTL each call, cheap).
    const res = await fetch(`${UPSTASH_URL}/pipeline`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${UPSTASH_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([
        ['INCR', key],
        ['EXPIRE', key, String(windowSec)],
      ]),
    });
    if (!res.ok) throw new Error(`Upstash ${res.status}`);
    const data = (await res.json()) as Array<{ result: number }>;
    const count = data?.[0]?.result ?? 1;
    const resetIn = RATE_LIMIT.windowMs - (Date.now() % RATE_LIMIT.windowMs);
    if (count > RATE_LIMIT.maxRequests) {
      return { allowed: false, remaining: 0, resetIn };
    }
    return { allowed: true, remaining: Math.max(0, RATE_LIMIT.maxRequests - count), resetIn };
  } catch (err) {
    console.error('[Security] Upstash rate limit failed, falling back to memory:', err);
    return checkRateLimitMemory(clientId);
  }
}

async function checkRateLimit(clientId: string): Promise<RateResult> {
  if (UPSTASH_ENABLED) return checkRateLimitDurable(clientId);
  if (!warnedNoDurableLimiter) {
    warnedNoDurableLimiter = true;
    console.warn(
      '[Security] No UPSTASH_REDIS_REST_URL configured — rate limiting is in-memory only ' +
        '(per-instance, resets on cold start). Set Upstash env vars for effective limiting.'
    );
  }
  return checkRateLimitMemory(clientId);
}

/**
 * Set CORS headers with a strict allowlist.
 * Unknown browser origins get NO Access-Control-Allow-Origin header (the
 * browser then blocks the response). Requests without an Origin header
 * (mobile apps, curl) are unaffected since CORS is browser-enforced.
 */
export function setCorsHeaders(req: VercelRequest, res: VercelResponse): boolean {
  const origin = req.headers.origin;

  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  } else if (origin) {
    // Unknown origin: do not reflect. Log for visibility.
    console.warn(`[Security] Blocked CORS origin: ${origin}`);
  }
  // No origin header => non-browser client; leave ACAO unset.

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key');
  res.setHeader('Access-Control-Max-Age', '86400'); // Cache preflight for 24 hours

  return true;
}

/**
 * Handle preflight OPTIONS request
 */
export function handlePreflight(req: VercelRequest, res: VercelResponse): boolean {
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true;
  }
  return false;
}

/**
 * Apply rate limiting
 */
export async function applyRateLimit(
  req: VercelRequest,
  res: VercelResponse
): Promise<{ allowed: boolean }> {
  const clientId = getClientId(req);
  const { allowed, remaining, resetIn } = await checkRateLimit(clientId);

  res.setHeader('X-RateLimit-Limit', RATE_LIMIT.maxRequests.toString());
  res.setHeader('X-RateLimit-Remaining', remaining.toString());
  res.setHeader('X-RateLimit-Reset', Math.ceil(resetIn / 1000).toString());

  if (!allowed) {
    res.status(429).json({
      error: 'Too many requests',
      retryAfter: Math.ceil(resetIn / 1000),
    });
    return { allowed: false };
  }

  return { allowed: true };
}

/**
 * Validate required HTTP method
 */
export function validateMethod(
  req: VercelRequest,
  res: VercelResponse,
  allowedMethods: string[]
): boolean {
  if (!allowedMethods.includes(req.method || '')) {
    res.status(405).json({ error: 'Method not allowed' });
    return false;
  }
  return true;
}

/**
 * Combined security middleware.
 * Returns true if the request should continue, false if a response was sent.
 * Async because durable rate limiting performs a network call.
 */
export async function applySecurity(
  req: VercelRequest,
  res: VercelResponse,
  options: {
    allowedMethods?: string[];
    skipRateLimit?: boolean;
  } = {}
): Promise<boolean> {
  const { allowedMethods = ['POST'], skipRateLimit = false } = options;

  setCorsHeaders(req, res);

  if (handlePreflight(req, res)) {
    return false;
  }

  if (!validateMethod(req, res, allowedMethods)) {
    return false;
  }

  if (!skipRateLimit) {
    const { allowed } = await applyRateLimit(req, res);
    if (!allowed) {
      return false;
    }
  }

  return true;
}

/**
 * Validate request body has required fields
 */
export function validateBody(
  req: VercelRequest,
  res: VercelResponse,
  requiredFields: string[]
): boolean {
  const body = req.body || {};

  for (const field of requiredFields) {
    if (body[field] === undefined || body[field] === null) {
      res.status(400).json({ error: `Missing required field: ${field}` });
      return false;
    }
  }

  return true;
}

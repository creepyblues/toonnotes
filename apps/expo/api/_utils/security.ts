/**
 * API Security Utilities
 *
 * Shared security middleware for Vercel Edge Functions:
 * - CORS allowlist
 * - Rate limiting
 * - Request validation
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

// Allowed origins for CORS
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

// Rate limiting store (in-memory, resets on cold start)
// For production, consider using Vercel KV or Redis
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

// Rate limit configuration
const RATE_LIMIT = {
  maxRequests: 30, // requests per window
  windowMs: 60 * 1000, // 1 minute window
};

/**
 * Get client identifier for rate limiting
 */
function getClientId(req: VercelRequest): string {
  // Use X-Forwarded-For header or fall back to a default
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return 'unknown';
}

/**
 * Check rate limit for a client
 */
function checkRateLimit(clientId: string): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(clientId);

  if (!entry || now > entry.resetAt) {
    // New window
    rateLimitStore.set(clientId, {
      count: 1,
      resetAt: now + RATE_LIMIT.windowMs,
    });
    return {
      allowed: true,
      remaining: RATE_LIMIT.maxRequests - 1,
      resetIn: RATE_LIMIT.windowMs,
    };
  }

  if (entry.count >= RATE_LIMIT.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetIn: entry.resetAt - now,
    };
  }

  entry.count++;
  return {
    allowed: true,
    remaining: RATE_LIMIT.maxRequests - entry.count,
    resetIn: entry.resetAt - now,
  };
}

/**
 * Set CORS headers with allowlist
 */
export function setCorsHeaders(req: VercelRequest, res: VercelResponse): boolean {
  const origin = req.headers.origin;

  // Check if origin is allowed
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else if (!origin) {
    // Allow requests without origin (e.g., mobile apps, curl)
    // The mobile app doesn't send origin header
    res.setHeader('Access-Control-Allow-Origin', '*');
  } else {
    // Origin not in allowlist - still set headers but log warning
    console.warn(`[Security] Unrecognized origin: ${origin}`);
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

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
export function applyRateLimit(
  req: VercelRequest,
  res: VercelResponse
): { allowed: boolean } {
  const clientId = getClientId(req);
  const { allowed, remaining, resetIn } = checkRateLimit(clientId);

  // Set rate limit headers
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
 * Combined security middleware
 * Returns true if request should continue, false if response was sent
 */
export function applySecurity(
  req: VercelRequest,
  res: VercelResponse,
  options: {
    allowedMethods?: string[];
    skipRateLimit?: boolean;
  } = {}
): boolean {
  const { allowedMethods = ['POST'], skipRateLimit = false } = options;

  // Set CORS headers
  setCorsHeaders(req, res);

  // Handle preflight
  if (handlePreflight(req, res)) {
    return false;
  }

  // Validate method
  if (!validateMethod(req, res, allowedMethods)) {
    return false;
  }

  // Apply rate limiting
  if (!skipRateLimit) {
    const { allowed } = applyRateLimit(req, res);
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

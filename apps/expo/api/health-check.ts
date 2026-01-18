/**
 * API Health Check Endpoint
 *
 * GET /api/health-check
 *
 * Monitors critical API endpoints and sends Slack alerts on failures.
 * Called by Vercel cron every 10 minutes.
 *
 * Environment variables:
 * - SLACK_WEBHOOK_URL: Webhook URL for failure alerts
 * - CRON_SECRET: Secret for verifying Vercel cron requests
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { applySecurity } from './_utils/security';

const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;
const CRON_SECRET = process.env.CRON_SECRET;

// Base URL for the API (self-referencing)
const API_BASE_URL = 'https://toonnotes-api.vercel.app';

// Endpoints to check
const ENDPOINTS_TO_CHECK = [
  {
    name: 'onboarding-config',
    path: '/api/onboarding-config',
    method: 'GET' as const,
    expectedStatus: 200,
    timeout: 10000,
  },
  {
    name: 'analyze-note-content',
    path: '/api/analyze-note-content',
    method: 'POST' as const,
    body: {
      noteTitle: 'Health check test note',
      noteContent: 'This is a test note for health check monitoring.',
    },
    expectedStatus: 200,
    timeout: 30000, // AI endpoint may take longer
  },
];

interface EndpointResult {
  name: string;
  status: 'healthy' | 'unhealthy';
  statusCode?: number;
  responseTime: number;
  error?: string;
}

interface HealthCheckResult {
  timestamp: string;
  overall: 'healthy' | 'unhealthy';
  endpoints: EndpointResult[];
  duration: number;
}

/**
 * Check a single endpoint
 */
async function checkEndpoint(endpoint: typeof ENDPOINTS_TO_CHECK[0]): Promise<EndpointResult> {
  const startTime = Date.now();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), endpoint.timeout);

    const response = await fetch(`${API_BASE_URL}${endpoint.path}`, {
      method: endpoint.method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: endpoint.method === 'POST' ? JSON.stringify(endpoint.body) : undefined,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const responseTime = Date.now() - startTime;

    if (response.status === endpoint.expectedStatus) {
      return {
        name: endpoint.name,
        status: 'healthy',
        statusCode: response.status,
        responseTime,
      };
    } else {
      // Try to get error message from response
      let errorMessage = `Expected status ${endpoint.expectedStatus}, got ${response.status}`;
      try {
        const body = await response.json();
        if (body.error) {
          errorMessage = `${errorMessage}: ${body.error}`;
        }
      } catch {
        // Ignore JSON parse errors
      }

      return {
        name: endpoint.name,
        status: 'unhealthy',
        statusCode: response.status,
        responseTime,
        error: errorMessage,
      };
    }
  } catch (error: any) {
    const responseTime = Date.now() - startTime;

    return {
      name: endpoint.name,
      status: 'unhealthy',
      responseTime,
      error: error.name === 'AbortError'
        ? `Timeout after ${endpoint.timeout}ms`
        : error.message || 'Unknown error',
    };
  }
}

/**
 * Send alert to Slack
 */
async function sendSlackAlert(result: HealthCheckResult): Promise<void> {
  if (!SLACK_WEBHOOK_URL) {
    console.warn('[Health Check] SLACK_WEBHOOK_URL not configured, skipping alert');
    return;
  }

  const failedEndpoints = result.endpoints.filter(e => e.status === 'unhealthy');

  const message = {
    text: `🚨 ToonNotes API Health Check Failed`,
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '🚨 ToonNotes API Health Check Failed',
          emoji: true,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*${failedEndpoints.length}* endpoint(s) are unhealthy`,
        },
      },
      {
        type: 'divider',
      },
      ...failedEndpoints.map(endpoint => ({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*${endpoint.name}*\n` +
            `Status: ${endpoint.statusCode || 'N/A'}\n` +
            `Response time: ${endpoint.responseTime}ms\n` +
            `Error: \`${endpoint.error}\``,
        },
      })),
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `Timestamp: ${result.timestamp} | Total check duration: ${result.duration}ms`,
          },
        ],
      },
    ],
  };

  try {
    const response = await fetch(SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      console.error('[Health Check] Failed to send Slack alert:', response.status);
    }
  } catch (error) {
    console.error('[Health Check] Error sending Slack alert:', error);
  }
}

/**
 * Verify cron authorization
 */
function verifyCronAuth(req: VercelRequest): boolean {
  // Allow local development without auth
  if (process.env.NODE_ENV === 'development') {
    return true;
  }

  // If no CRON_SECRET is set, allow all requests (for initial setup)
  if (!CRON_SECRET) {
    console.warn('[Health Check] CRON_SECRET not configured, allowing request');
    return true;
  }

  // Vercel adds Authorization header for cron jobs
  const authHeader = req.headers['authorization'];
  if (authHeader === `Bearer ${CRON_SECRET}`) {
    return true;
  }

  // Also allow direct access for testing (optional - remove in production if needed)
  // This allows curl testing without the secret
  return true;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Apply security middleware (CORS, skip rate limiting for health check)
  if (!applySecurity(req, res, { allowedMethods: ['GET'], skipRateLimit: true })) {
    return;
  }

  // Verify cron authorization
  if (!verifyCronAuth(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const startTime = Date.now();
  const timestamp = new Date().toISOString();

  console.log(`[Health Check] Starting health check at ${timestamp}`);

  // Check all endpoints in parallel
  const endpointResults = await Promise.all(
    ENDPOINTS_TO_CHECK.map(checkEndpoint)
  );

  const duration = Date.now() - startTime;
  const hasFailures = endpointResults.some(r => r.status === 'unhealthy');

  const result: HealthCheckResult = {
    timestamp,
    overall: hasFailures ? 'unhealthy' : 'healthy',
    endpoints: endpointResults,
    duration,
  };

  console.log(`[Health Check] Complete. Overall: ${result.overall}, Duration: ${duration}ms`);

  // Send Slack alert if any endpoint is unhealthy
  if (hasFailures) {
    console.log('[Health Check] Failures detected, sending Slack alert...');
    await sendSlackAlert(result);
  }

  // Return appropriate status code
  const statusCode = hasFailures ? 503 : 200;

  // Set cache headers to prevent caching
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

  return res.status(statusCode).json(result);
}

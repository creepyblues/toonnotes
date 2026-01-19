/**
 * Google Service Account Authentication for GA4 APIs
 *
 * Uses JWT to authenticate with Google APIs.
 * Service account credentials are stored in environment variables.
 */

import { GoogleAuth, JWT } from 'google-auth-library';

// GA4 API scopes
const GA4_SCOPES = [
  'https://www.googleapis.com/auth/analytics.readonly', // Data API read
  'https://www.googleapis.com/auth/analytics.edit',     // Admin API write
];

// Singleton JWT client
let jwtClient: JWT | null = null;

/**
 * Get service account credentials from environment variables
 */
function getServiceAccountCredentials() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const keyBase64 = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;

  if (!email || !keyBase64) {
    throw new Error(
      'Missing Google service account credentials. ' +
      'Set GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_SERVICE_ACCOUNT_KEY environment variables.'
    );
  }

  // Decode base64-encoded private key
  const privateKey = Buffer.from(keyBase64, 'base64').toString('utf-8');

  return { email, privateKey };
}

/**
 * Get or create JWT client for Google API authentication
 */
export function getJwtClient(): JWT {
  if (jwtClient) {
    return jwtClient;
  }

  const { email, privateKey } = getServiceAccountCredentials();

  jwtClient = new JWT({
    email,
    key: privateKey,
    scopes: GA4_SCOPES,
  });

  return jwtClient;
}

/**
 * Get access token for API calls
 * Automatically handles token refresh
 */
export async function getAccessToken(): Promise<string> {
  const client = getJwtClient();
  const { token } = await client.getAccessToken();

  if (!token) {
    throw new Error('Failed to obtain access token from Google');
  }

  return token;
}

/**
 * Make authenticated request to Google API
 */
export async function makeAuthenticatedRequest<T>(
  url: string,
  options: {
    method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
    body?: unknown;
  } = {}
): Promise<T> {
  const token = await getAccessToken();
  const { method = 'GET', body } = options;

  const response = await fetch(url, {
    method,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Google API error (${response.status}): ${errorText}`);
  }

  return response.json() as Promise<T>;
}

/**
 * Get GA4 property ID from environment
 */
export function getPropertyId(): string {
  const propertyId = process.env.GA4_PROPERTY_ID;

  if (!propertyId) {
    throw new Error(
      'Missing GA4 property ID. Set GA4_PROPERTY_ID environment variable.'
    );
  }

  return propertyId;
}

/**
 * Get full property path for API calls (format: properties/123456789)
 */
export function getPropertyPath(): string {
  const propertyId = getPropertyId();
  return `properties/${propertyId}`;
}

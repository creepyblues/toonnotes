/**
 * GA4 Realtime API Client
 *
 * Provides methods to query real-time GA4 data:
 * - Current active users
 * - Recent events (last 30 minutes)
 * - Currently viewed pages
 * - User locations
 *
 * API Reference: https://developers.google.com/analytics/devguides/reporting/data/v1/realtime-basics
 */

import { makeAuthenticatedRequest, getPropertyPath } from '../auth/google';
import type { Dimension, Metric, FilterExpression } from './data';

const DATA_API_BASE = 'https://analyticsdata.googleapis.com/v1beta';

// ============================================
// Types
// ============================================

export interface RealtimeRequest {
  dimensions?: Dimension[];
  metrics?: Metric[];
  dimensionFilter?: FilterExpression;
  metricFilter?: FilterExpression;
  limit?: number;
  minuteRanges?: Array<{
    name?: string;
    startMinutesAgo?: number;
    endMinutesAgo?: number;
  }>;
}

export interface RealtimeDimensionValue {
  value: string;
}

export interface RealtimeMetricValue {
  value: string;
}

export interface RealtimeRow {
  dimensionValues: RealtimeDimensionValue[];
  metricValues: RealtimeMetricValue[];
}

export interface RealtimeResponse {
  dimensionHeaders: Array<{ name: string }>;
  metricHeaders: Array<{ name: string; type: string }>;
  rows: RealtimeRow[];
  rowCount: number;
  propertyQuota?: {
    tokensPerDay: { consumed: number; remaining: number };
    tokensPerHour: { consumed: number; remaining: number };
    concurrentRequests: { consumed: number; remaining: number };
  };
}

// ============================================
// API Functions
// ============================================

/**
 * Run a real-time report query
 * Note: Real-time data has a lookback window of 30 minutes (60 for GA4 360)
 */
export async function runRealtimeReport(
  request: RealtimeRequest
): Promise<RealtimeResponse> {
  const propertyPath = getPropertyPath();
  const url = `${DATA_API_BASE}/${propertyPath}:runRealtimeReport`;

  return makeAuthenticatedRequest<RealtimeResponse>(url, {
    method: 'POST',
    body: {
      ...request,
      // Default to last 30 minutes if no range specified
      minuteRanges: request.minuteRanges || [
        { startMinutesAgo: 29, endMinutesAgo: 0 },
      ],
    },
  });
}

// ============================================
// Convenience Functions
// ============================================

/**
 * Get current active users count
 */
export async function getActiveUsers(): Promise<{
  activeUsers: number;
  byDevice: Record<string, number>;
}> {
  const response = await runRealtimeReport({
    dimensions: [{ name: 'deviceCategory' }],
    metrics: [{ name: 'activeUsers' }],
  });

  let total = 0;
  const byDevice: Record<string, number> = {};

  for (const row of response.rows || []) {
    const device = row.dimensionValues[0]?.value || 'unknown';
    const users = parseInt(row.metricValues[0]?.value || '0', 10);
    byDevice[device] = users;
    total += users;
  }

  return { activeUsers: total, byDevice };
}

/**
 * Get recent events (last 30 minutes)
 */
export async function getRecentEvents(options: {
  eventName?: string;
  limit?: number;
} = {}): Promise<Array<{ eventName: string; eventCount: number }>> {
  const request: RealtimeRequest = {
    dimensions: [{ name: 'eventName' }],
    metrics: [{ name: 'eventCount' }],
    limit: options.limit || 20,
  };

  // Filter by specific event name if provided
  if (options.eventName) {
    request.dimensionFilter = {
      filter: {
        fieldName: 'eventName',
        stringFilter: {
          matchType: 'EXACT',
          value: options.eventName,
        },
      },
    };
  }

  const response = await runRealtimeReport(request);

  return (response.rows || []).map((row) => ({
    eventName: row.dimensionValues[0]?.value || 'unknown',
    eventCount: parseInt(row.metricValues[0]?.value || '0', 10),
  }));
}

/**
 * Get currently viewed pages
 */
export async function getCurrentPages(options: {
  limit?: number;
} = {}): Promise<Array<{ pageTitle: string; pagePath: string; activeUsers: number }>> {
  const response = await runRealtimeReport({
    dimensions: [{ name: 'pageTitle' }, { name: 'pagePath' }],
    metrics: [{ name: 'activeUsers' }],
    limit: options.limit || 10,
  });

  return (response.rows || []).map((row) => ({
    pageTitle: row.dimensionValues[0]?.value || '(not set)',
    pagePath: row.dimensionValues[1]?.value || '/',
    activeUsers: parseInt(row.metricValues[0]?.value || '0', 10),
  }));
}

/**
 * Get user locations (countries/cities)
 */
export async function getUserLocations(options: {
  granularity?: 'country' | 'city';
  limit?: number;
} = {}): Promise<Array<{ location: string; activeUsers: number }>> {
  const dimensionName = options.granularity === 'city' ? 'city' : 'country';

  const response = await runRealtimeReport({
    dimensions: [{ name: dimensionName }],
    metrics: [{ name: 'activeUsers' }],
    limit: options.limit || 10,
  });

  return (response.rows || []).map((row) => ({
    location: row.dimensionValues[0]?.value || '(not set)',
    activeUsers: parseInt(row.metricValues[0]?.value || '0', 10),
  }));
}

/**
 * Get user traffic sources
 */
export async function getTrafficSources(options: {
  limit?: number;
} = {}): Promise<Array<{ source: string; medium: string; activeUsers: number }>> {
  const response = await runRealtimeReport({
    dimensions: [
      { name: 'sessionSource' },
      { name: 'sessionMedium' },
    ],
    metrics: [{ name: 'activeUsers' }],
    limit: options.limit || 10,
  });

  return (response.rows || []).map((row) => ({
    source: row.dimensionValues[0]?.value || '(direct)',
    medium: row.dimensionValues[1]?.value || '(none)',
    activeUsers: parseInt(row.metricValues[0]?.value || '0', 10),
  }));
}

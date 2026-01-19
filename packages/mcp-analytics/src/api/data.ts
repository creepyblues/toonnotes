/**
 * GA4 Data API Client
 *
 * Provides methods to query GA4 analytics data:
 * - Run reports (dimensions, metrics, filters)
 * - Batch reports
 * - Get metadata (available dimensions/metrics)
 *
 * API Reference: https://developers.google.com/analytics/devguides/reporting/data/v1
 */

import { makeAuthenticatedRequest, getPropertyPath } from '../auth/google';

const DATA_API_BASE = 'https://analyticsdata.googleapis.com/v1beta';

// ============================================
// Types
// ============================================

export interface DateRange {
  startDate: string; // YYYY-MM-DD or relative (e.g., "7daysAgo", "today")
  endDate: string;
}

export interface Dimension {
  name: string;
}

export interface Metric {
  name: string;
}

export interface Filter {
  fieldName: string;
  stringFilter?: {
    matchType: 'EXACT' | 'BEGINS_WITH' | 'ENDS_WITH' | 'CONTAINS' | 'REGEXP';
    value: string;
    caseSensitive?: boolean;
  };
  numericFilter?: {
    operation: 'EQUAL' | 'LESS_THAN' | 'LESS_THAN_OR_EQUAL' | 'GREATER_THAN' | 'GREATER_THAN_OR_EQUAL';
    value: { int64Value?: string; doubleValue?: number };
  };
}

export interface FilterExpression {
  filter?: Filter;
  andGroup?: { expressions: FilterExpression[] };
  orGroup?: { expressions: FilterExpression[] };
  notExpression?: FilterExpression;
}

export interface ReportRequest {
  dateRanges?: DateRange[];
  dimensions?: Dimension[];
  metrics?: Metric[];
  dimensionFilter?: FilterExpression;
  metricFilter?: FilterExpression;
  limit?: number;
  offset?: number;
  orderBys?: Array<{
    dimension?: { dimensionName: string };
    metric?: { metricName: string };
    desc?: boolean;
  }>;
}

export interface DimensionValue {
  value: string;
}

export interface MetricValue {
  value: string;
}

export interface ReportRow {
  dimensionValues: DimensionValue[];
  metricValues: MetricValue[];
}

export interface ReportResponse {
  dimensionHeaders: Array<{ name: string }>;
  metricHeaders: Array<{ name: string; type: string }>;
  rows: ReportRow[];
  rowCount: number;
  metadata?: {
    currencyCode?: string;
    timeZone?: string;
  };
}

export interface MetadataResponse {
  name: string;
  dimensions: Array<{
    apiName: string;
    uiName: string;
    description: string;
    category: string;
  }>;
  metrics: Array<{
    apiName: string;
    uiName: string;
    description: string;
    category: string;
    type: string;
  }>;
}

// ============================================
// API Functions
// ============================================

/**
 * Run a report query
 */
export async function runReport(request: ReportRequest): Promise<ReportResponse> {
  const propertyPath = getPropertyPath();
  const url = `${DATA_API_BASE}/${propertyPath}:runReport`;

  return makeAuthenticatedRequest<ReportResponse>(url, {
    method: 'POST',
    body: {
      ...request,
      // Ensure dateRanges has a default if not provided
      dateRanges: request.dateRanges || [{ startDate: '7daysAgo', endDate: 'today' }],
    },
  });
}

/**
 * Run multiple reports in a single request (more efficient)
 */
export async function batchRunReports(
  requests: ReportRequest[]
): Promise<{ reports: ReportResponse[] }> {
  const propertyPath = getPropertyPath();
  const url = `${DATA_API_BASE}/${propertyPath}:batchRunReports`;

  return makeAuthenticatedRequest<{ reports: ReportResponse[] }>(url, {
    method: 'POST',
    body: {
      requests: requests.map((req) => ({
        ...req,
        dateRanges: req.dateRanges || [{ startDate: '7daysAgo', endDate: 'today' }],
      })),
    },
  });
}

/**
 * Get available dimensions and metrics metadata
 */
export async function getMetadata(): Promise<MetadataResponse> {
  const propertyPath = getPropertyPath();
  const url = `${DATA_API_BASE}/${propertyPath}/metadata`;

  return makeAuthenticatedRequest<MetadataResponse>(url);
}

/**
 * Check if dimension/metric combinations are compatible
 */
export async function checkCompatibility(
  dimensions: string[],
  metrics: string[]
): Promise<{
  dimensionCompatibilities: Array<{
    compatibility: string;
    dimensionMetadata: { apiName: string };
  }>;
  metricCompatibilities: Array<{
    compatibility: string;
    metricMetadata: { apiName: string };
  }>;
}> {
  const propertyPath = getPropertyPath();
  const url = `${DATA_API_BASE}/${propertyPath}:checkCompatibility`;

  return makeAuthenticatedRequest(url, {
    method: 'POST',
    body: {
      dimensions: dimensions.map((name) => ({ name })),
      metrics: metrics.map((name) => ({ name })),
    },
  });
}

// ============================================
// Helper Functions
// ============================================

/**
 * Parse report response into a more usable format
 */
export function parseReportToRecords(
  response: ReportResponse
): Array<Record<string, string | number>> {
  if (!response) {
    return [];
  }

  const dimensionNames = (response.dimensionHeaders || []).map((h) => h.name);
  const metricNames = (response.metricHeaders || []).map((h) => h.name);
  const metricTypes = (response.metricHeaders || []).map((h) => h.type);

  return (response.rows || []).map((row) => {
    const record: Record<string, string | number> = {};

    // Add dimensions
    (row.dimensionValues || []).forEach((dv, i) => {
      if (dimensionNames[i]) {
        record[dimensionNames[i]] = dv.value;
      }
    });

    // Add metrics (convert to number if appropriate)
    (row.metricValues || []).forEach((mv, i) => {
      const value = mv.value;
      const type = metricTypes[i];

      if (metricNames[i]) {
        if (type === 'TYPE_INTEGER' || type === 'TYPE_FLOAT' || type === 'TYPE_CURRENCY') {
          record[metricNames[i]] = parseFloat(value);
        } else {
          record[metricNames[i]] = value;
        }
      }
    });

    return record;
  });
}

/**
 * Create a date range for common periods
 */
export function createDateRange(period: 'today' | '7d' | '30d' | '90d' | 'year'): DateRange {
  switch (period) {
    case 'today':
      return { startDate: 'today', endDate: 'today' };
    case '7d':
      return { startDate: '7daysAgo', endDate: 'today' };
    case '30d':
      return { startDate: '30daysAgo', endDate: 'today' };
    case '90d':
      return { startDate: '90daysAgo', endDate: 'today' };
    case 'year':
      return { startDate: '365daysAgo', endDate: 'today' };
    default:
      return { startDate: '7daysAgo', endDate: 'today' };
  }
}

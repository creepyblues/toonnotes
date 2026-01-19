/**
 * MCP Query Tools
 *
 * Tools for querying GA4 analytics data:
 * - Run custom reports
 * - Get active users
 * - Get top events
 * - Get user metrics
 * - Get page views
 */

import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import {
  runReport,
  batchRunReports,
  getMetadata,
  parseReportToRecords,
  createDateRange,
  type ReportRequest,
} from '../api/data';

// ============================================
// Tool Registration
// ============================================

export function registerQueryTools(server: McpServer) {
  // Run custom report
  server.registerTool(
    'ga4_run_report',
    {
      description: 'Run a custom GA4 report with specified dimensions, metrics, and filters',
      inputSchema: {
        dimensions: z
          .array(z.string())
          .describe('Dimension names (e.g., ["date", "country", "deviceCategory"])'),
        metrics: z
          .array(z.string())
          .describe('Metric names (e.g., ["activeUsers", "sessions", "eventCount"])'),
        startDate: z
          .string()
          .optional()
          .describe('Start date (YYYY-MM-DD or "7daysAgo"). Default: 7daysAgo'),
        endDate: z
          .string()
          .optional()
          .describe('End date (YYYY-MM-DD or "today"). Default: today'),
        limit: z.number().optional().describe('Max rows to return. Default: 100'),
      },
    },
    async ({ dimensions, metrics, startDate, endDate, limit }: {
      dimensions: string[];
      metrics: string[];
      startDate?: string;
      endDate?: string;
      limit?: number;
    }) => {
      try {
        const request: ReportRequest = {
          dimensions: dimensions.map((name) => ({ name })),
          metrics: metrics.map((name) => ({ name })),
          dateRanges: [
            {
              startDate: startDate || '7daysAgo',
              endDate: endDate || 'today',
            },
          ],
          limit: limit || 100,
        };

        const response = await runReport(request);
        const records = parseReportToRecords(response);

        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(
                {
                  rowCount: response.rowCount,
                  data: records,
                },
                null,
                2
              ),
            },
          ],
        };
      } catch (error) {
        return {
          isError: true,
          content: [
            {
              type: 'text' as const,
              text: `Error running report: ${(error as Error).message}`,
            },
          ],
        };
      }
    }
  );

  // Get active users
  server.registerTool(
    'ga4_get_active_users',
    {
      description: 'Get active user counts for a time period, broken down by device',
      inputSchema: {
        period: z.enum(['today', '7d', '30d', '90d', 'year']).default('7d').describe('Time period'),
      },
    },
    async ({ period }: { period: 'today' | '7d' | '30d' | '90d' | 'year' }) => {
      try {
        const dateRange = createDateRange(period);

        const response = await runReport({
          dimensions: [{ name: 'deviceCategory' }],
          metrics: [{ name: 'activeUsers' }, { name: 'newUsers' }],
          dateRanges: [dateRange],
        });

        const byDevice = parseReportToRecords(response);

        // Calculate totals
        const totals = byDevice.reduce(
          (acc: { activeUsers: number; newUsers: number }, row) => ({
            activeUsers: acc.activeUsers + (Number(row.activeUsers) || 0),
            newUsers: acc.newUsers + (Number(row.newUsers) || 0),
          }),
          { activeUsers: 0, newUsers: 0 }
        );

        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(
                {
                  period,
                  totals,
                  byDevice,
                },
                null,
                2
              ),
            },
          ],
        };
      } catch (error) {
        return {
          isError: true,
          content: [
            {
              type: 'text' as const,
              text: `Error getting active users: ${(error as Error).message}`,
            },
          ],
        };
      }
    }
  );

  // Get top events
  server.registerTool(
    'ga4_get_top_events',
    {
      description: 'Get the most frequent events in GA4',
      inputSchema: {
        period: z.enum(['today', '7d', '30d', '90d', 'year']).default('7d').describe('Time period'),
        limit: z.number().optional().describe('Max events to return. Default: 20'),
      },
    },
    async ({ period, limit }: { period: 'today' | '7d' | '30d' | '90d' | 'year'; limit?: number }) => {
      try {
        const dateRange = createDateRange(period);

        const response = await runReport({
          dimensions: [{ name: 'eventName' }],
          metrics: [{ name: 'eventCount' }, { name: 'totalUsers' }],
          dateRanges: [dateRange],
          limit: limit || 20,
          orderBys: [{ metric: { metricName: 'eventCount' }, desc: true }],
        });

        const events = parseReportToRecords(response);

        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(
                {
                  period,
                  totalEvents: response.rowCount,
                  events,
                },
                null,
                2
              ),
            },
          ],
        };
      } catch (error) {
        return {
          isError: true,
          content: [
            {
              type: 'text' as const,
              text: `Error getting top events: ${(error as Error).message}`,
            },
          ],
        };
      }
    }
  );

  // Get user metrics (acquisition, engagement)
  server.registerTool(
    'ga4_get_user_metrics',
    {
      description: 'Get user acquisition and engagement metrics',
      inputSchema: {
        period: z.enum(['today', '7d', '30d', '90d', 'year']).default('7d').describe('Time period'),
      },
    },
    async ({ period }: { period: 'today' | '7d' | '30d' | '90d' | 'year' }) => {
      try {
        const dateRange = createDateRange(period);

        // Batch multiple reports for efficiency
        const { reports } = await batchRunReports([
          // Overall metrics
          {
            metrics: [
              { name: 'activeUsers' },
              { name: 'newUsers' },
              { name: 'sessions' },
              { name: 'engagedSessions' },
              { name: 'averageSessionDuration' },
              { name: 'screenPageViews' },
            ],
            dateRanges: [dateRange],
          },
          // Acquisition by source
          {
            dimensions: [{ name: 'sessionSource' }],
            metrics: [{ name: 'sessions' }, { name: 'newUsers' }],
            dateRanges: [dateRange],
            limit: 10,
          },
        ]);

        const overallMetrics = parseReportToRecords(reports[0])[0] || {};
        const acquisitionBySource = parseReportToRecords(reports[1]);

        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(
                {
                  period,
                  overall: overallMetrics,
                  acquisitionBySource,
                },
                null,
                2
              ),
            },
          ],
        };
      } catch (error) {
        return {
          isError: true,
          content: [
            {
              type: 'text' as const,
              text: `Error getting user metrics: ${(error as Error).message}`,
            },
          ],
        };
      }
    }
  );

  // Get page views breakdown
  server.registerTool(
    'ga4_get_page_views',
    {
      description: 'Get page view breakdown by title or path',
      inputSchema: {
        period: z.enum(['today', '7d', '30d', '90d', 'year']).default('7d').describe('Time period'),
        dimension: z
          .enum(['pageTitle', 'pagePath', 'pagePathPlusQueryString'])
          .default('pageTitle')
          .describe('Dimension to break down by'),
        limit: z.number().optional().describe('Max pages to return. Default: 20'),
      },
    },
    async ({ period, dimension, limit }: {
      period: 'today' | '7d' | '30d' | '90d' | 'year';
      dimension: 'pageTitle' | 'pagePath' | 'pagePathPlusQueryString';
      limit?: number;
    }) => {
      try {
        const dateRange = createDateRange(period);

        const response = await runReport({
          dimensions: [{ name: dimension }],
          metrics: [
            { name: 'screenPageViews' },
            { name: 'activeUsers' },
            { name: 'averageSessionDuration' },
          ],
          dateRanges: [dateRange],
          limit: limit || 20,
          orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
        });

        const pages = parseReportToRecords(response);

        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(
                {
                  period,
                  dimension,
                  totalPages: response.rowCount,
                  pages,
                },
                null,
                2
              ),
            },
          ],
        };
      } catch (error) {
        return {
          isError: true,
          content: [
            {
              type: 'text' as const,
              text: `Error getting page views: ${(error as Error).message}`,
            },
          ],
        };
      }
    }
  );

  // Get available dimensions and metrics
  server.registerTool(
    'ga4_get_metadata',
    {
      description: 'Get available dimensions and metrics for the GA4 property',
      inputSchema: {},
    },
    async () => {
      try {
        const metadata = await getMetadata();

        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(
                {
                  dimensionCount: metadata.dimensions.length,
                  metricCount: metadata.metrics.length,
                  dimensions: metadata.dimensions.map((d) => ({
                    name: d.apiName,
                    displayName: d.uiName,
                    category: d.category,
                  })),
                  metrics: metadata.metrics.map((m) => ({
                    name: m.apiName,
                    displayName: m.uiName,
                    type: m.type,
                    category: m.category,
                  })),
                },
                null,
                2
              ),
            },
          ],
        };
      } catch (error) {
        return {
          isError: true,
          content: [
            {
              type: 'text' as const,
              text: `Error getting metadata: ${(error as Error).message}`,
            },
          ],
        };
      }
    }
  );
}

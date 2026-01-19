/**
 * MCP Export Tools
 *
 * Tools for exporting and batch processing GA4 reports:
 * - Batch reports (multiple queries in one call)
 * - CSV export
 * - Summary reports
 */

import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import {
  batchRunReports,
  runReport,
  parseReportToRecords,
  createDateRange,
  type ReportRequest,
} from '../api/data';

// ============================================
// Schema Definitions
// ============================================

const ReportConfigSchema = z.object({
  name: z.string().describe('Name/identifier for this report'),
  dimensions: z.array(z.string()).describe('Dimension names'),
  metrics: z.array(z.string()).describe('Metric names'),
  startDate: z.string().optional().describe('Start date (default: 7daysAgo)'),
  endDate: z.string().optional().describe('End date (default: today)'),
  limit: z.number().optional().describe('Max rows (default: 100)'),
});

type ReportConfig = z.infer<typeof ReportConfigSchema>;

// ============================================
// Tool Registration
// ============================================

export function registerExportTools(server: McpServer) {
  // Batch reports
  server.registerTool(
    'ga4_batch_report',
    {
      description: 'Run multiple reports in a single efficient API call',
      inputSchema: {
        reports: z
          .array(ReportConfigSchema)
          .min(1)
          .max(5)
          .describe('Array of report configurations (max 5)'),
      },
    },
    async ({ reports }: { reports: ReportConfig[] }) => {
      try {
        const requests: ReportRequest[] = reports.map((r) => ({
          dimensions: r.dimensions.map((name) => ({ name })),
          metrics: r.metrics.map((name) => ({ name })),
          dateRanges: [
            {
              startDate: r.startDate || '7daysAgo',
              endDate: r.endDate || 'today',
            },
          ],
          limit: r.limit || 100,
        }));

        const { reports: responses } = await batchRunReports(requests);

        const results = reports.map((config, i) => ({
          name: config.name,
          rowCount: responses[i].rowCount,
          data: parseReportToRecords(responses[i]),
        }));

        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(
                {
                  reportCount: results.length,
                  reports: results,
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
              text: `Error running batch reports: ${(error as Error).message}`,
            },
          ],
        };
      }
    }
  );

  // Export as CSV format
  server.registerTool(
    'ga4_export_csv',
    {
      description: 'Run a report and export as CSV format',
      inputSchema: {
        dimensions: z
          .array(z.string())
          .describe('Dimension names (e.g., ["date", "country"])'),
        metrics: z
          .array(z.string())
          .describe('Metric names (e.g., ["activeUsers", "sessions"])'),
        startDate: z
          .string()
          .optional()
          .describe('Start date (default: 7daysAgo)'),
        endDate: z
          .string()
          .optional()
          .describe('End date (default: today)'),
        limit: z.number().optional().describe('Max rows (default: 1000)'),
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
        const response = await runReport({
          dimensions: dimensions.map((name) => ({ name })),
          metrics: metrics.map((name) => ({ name })),
          dateRanges: [
            {
              startDate: startDate || '7daysAgo',
              endDate: endDate || 'today',
            },
          ],
          limit: limit || 1000,
        });

        // Build CSV
        const headers = [
          ...response.dimensionHeaders.map((h) => h.name),
          ...response.metricHeaders.map((h) => h.name),
        ];

        const rows = (response.rows || []).map((row) => {
          const values = [
            ...row.dimensionValues.map((v) => escapeCSV(v.value)),
            ...row.metricValues.map((v) => v.value),
          ];
          return values.join(',');
        });

        const csv = [headers.join(','), ...rows].join('\n');

        return {
          content: [
            {
              type: 'text' as const,
              text: `CSV Export (${response.rowCount} rows):\n\n${csv}`,
            },
          ],
        };
      } catch (error) {
        return {
          isError: true,
          content: [
            {
              type: 'text' as const,
              text: `Error exporting CSV: ${(error as Error).message}`,
            },
          ],
        };
      }
    }
  );

  // Summary report (pre-defined comprehensive overview)
  server.registerTool(
    'ga4_summary_report',
    {
      description: 'Generate a comprehensive summary report with key metrics',
      inputSchema: {
        period: z
          .enum(['today', '7d', '30d', '90d', 'year'])
          .default('30d')
          .describe('Time period for the summary'),
      },
    },
    async ({ period }: { period: 'today' | '7d' | '30d' | '90d' | 'year' }) => {
      try {
        const dateRange = createDateRange(period);

        // Run multiple reports for comprehensive summary
        const { reports } = await batchRunReports([
          // Overall metrics
          {
            metrics: [
              { name: 'activeUsers' },
              { name: 'newUsers' },
              { name: 'sessions' },
              { name: 'engagedSessions' },
              { name: 'screenPageViews' },
              { name: 'averageSessionDuration' },
              { name: 'eventCount' },
            ],
            dateRanges: [dateRange],
          },
          // Daily trend
          {
            dimensions: [{ name: 'date' }],
            metrics: [{ name: 'activeUsers' }, { name: 'sessions' }],
            dateRanges: [dateRange],
            orderBys: [{ dimension: { dimensionName: 'date' } }],
          },
          // Top pages
          {
            dimensions: [{ name: 'pageTitle' }],
            metrics: [{ name: 'screenPageViews' }],
            dateRanges: [dateRange],
            limit: 10,
            orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
          },
          // Top events
          {
            dimensions: [{ name: 'eventName' }],
            metrics: [{ name: 'eventCount' }],
            dateRanges: [dateRange],
            limit: 10,
            orderBys: [{ metric: { metricName: 'eventCount' }, desc: true }],
          },
          // Device breakdown
          {
            dimensions: [{ name: 'deviceCategory' }],
            metrics: [{ name: 'activeUsers' }, { name: 'sessions' }],
            dateRanges: [dateRange],
          },
          // Country breakdown
          {
            dimensions: [{ name: 'country' }],
            metrics: [{ name: 'activeUsers' }],
            dateRanges: [dateRange],
            limit: 10,
            orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
          },
        ]);

        const overall = parseReportToRecords(reports[0])[0] || {};
        const dailyTrend = parseReportToRecords(reports[1]);
        const topPages = parseReportToRecords(reports[2]);
        const topEvents = parseReportToRecords(reports[3]);
        const devices = parseReportToRecords(reports[4]);
        const countries = parseReportToRecords(reports[5]);

        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(
                {
                  period,
                  generatedAt: new Date().toISOString(),
                  summary: {
                    overall: {
                      activeUsers: overall.activeUsers,
                      newUsers: overall.newUsers,
                      sessions: overall.sessions,
                      engagedSessions: overall.engagedSessions,
                      pageViews: overall.screenPageViews,
                      avgSessionDuration: overall.averageSessionDuration,
                      totalEvents: overall.eventCount,
                    },
                    trends: {
                      daily: dailyTrend,
                    },
                    topContent: {
                      pages: topPages,
                      events: topEvents,
                    },
                    demographics: {
                      devices,
                      countries,
                    },
                  },
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
              text: `Error generating summary report: ${(error as Error).message}`,
            },
          ],
        };
      }
    }
  );

  // Compare periods
  server.registerTool(
    'ga4_compare_periods',
    {
      description: 'Compare metrics between two time periods',
      inputSchema: {
        dimensions: z
          .array(z.string())
          .optional()
          .describe('Optional dimensions to break down by'),
        metrics: z
          .array(z.string())
          .describe('Metrics to compare'),
        currentPeriod: z.object({
          startDate: z.string(),
          endDate: z.string(),
        }).describe('Current period date range'),
        previousPeriod: z.object({
          startDate: z.string(),
          endDate: z.string(),
        }).describe('Previous period date range to compare against'),
      },
    },
    async ({ dimensions, metrics, currentPeriod, previousPeriod }: {
      dimensions?: string[];
      metrics: string[];
      currentPeriod: { startDate: string; endDate: string };
      previousPeriod: { startDate: string; endDate: string };
    }) => {
      try {
        const requests: ReportRequest[] = [
          {
            dimensions: dimensions?.map((name) => ({ name })),
            metrics: metrics.map((name) => ({ name })),
            dateRanges: [currentPeriod],
            limit: 100,
          },
          {
            dimensions: dimensions?.map((name) => ({ name })),
            metrics: metrics.map((name) => ({ name })),
            dateRanges: [previousPeriod],
            limit: 100,
          },
        ];

        const { reports } = await batchRunReports(requests);

        const currentData = parseReportToRecords(reports[0]);
        const previousData = parseReportToRecords(reports[1]);

        // Calculate totals for comparison
        const calculateTotals = (data: Array<Record<string, string | number>>) => {
          const totals: Record<string, number> = {};
          for (const metric of metrics) {
            totals[metric] = data.reduce(
              (sum, row) => sum + ((row[metric] as number) || 0),
              0
            );
          }
          return totals;
        };

        const currentTotals = calculateTotals(currentData);
        const previousTotals = calculateTotals(previousData);

        // Calculate percentage changes
        const changes: Record<string, { current: number; previous: number; change: number; changePercent: string }> = {};
        for (const metric of metrics) {
          const current = currentTotals[metric];
          const previous = previousTotals[metric];
          const change = current - previous;
          const changePercent =
            previous === 0
              ? current > 0
                ? '+100%'
                : '0%'
              : `${change >= 0 ? '+' : ''}${((change / previous) * 100).toFixed(1)}%`;

          changes[metric] = {
            current,
            previous,
            change,
            changePercent,
          };
        }

        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(
                {
                  currentPeriod,
                  previousPeriod,
                  comparison: changes,
                  currentData,
                  previousData,
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
              text: `Error comparing periods: ${(error as Error).message}`,
            },
          ],
        };
      }
    }
  );
}

// ============================================
// Helper Functions
// ============================================

function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

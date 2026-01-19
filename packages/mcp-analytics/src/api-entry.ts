/**
 * MCP Server API Endpoint for Vercel
 *
 * This serverless function handles MCP protocol requests for GA4 analytics tools.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  runReport,
  batchRunReports,
  getMetadata,
  parseReportToRecords,
  createDateRange,
  type ReportRequest,
} from './api/data';
import {
  getActiveUsers,
  getRecentEvents,
  getCurrentPages,
  getUserLocations,
  getTrafficSources,
} from './api/realtime';
import {
  listCustomDimensions,
  createCustomDimension,
  listCustomMetrics,
  createCustomMetric,
  listKeyEvents,
  createKeyEvent,
  listAudiences,
  createAudience,
  getProperty,
  listAccountSummaries,
  getDataRetentionSettings,
  type DimensionScope,
  type CountingMethod,
} from './api/admin';

// Tool definitions for listing
const TOOLS = [
  // Query tools
  {
    name: 'ga4_run_report',
    description: 'Run a custom GA4 report with specified dimensions, metrics, and filters',
    inputSchema: {
      type: 'object',
      properties: {
        dimensions: { type: 'array', items: { type: 'string' }, description: 'Dimension names' },
        metrics: { type: 'array', items: { type: 'string' }, description: 'Metric names' },
        startDate: { type: 'string', description: 'Start date (YYYY-MM-DD or "7daysAgo")' },
        endDate: { type: 'string', description: 'End date (YYYY-MM-DD or "today")' },
        limit: { type: 'number', description: 'Max rows to return' },
      },
      required: ['dimensions', 'metrics'],
    },
  },
  {
    name: 'ga4_get_active_users',
    description: 'Get active user counts for a time period, broken down by device',
    inputSchema: {
      type: 'object',
      properties: {
        period: { type: 'string', enum: ['today', '7d', '30d', '90d', 'year'], description: 'Time period' },
      },
    },
  },
  {
    name: 'ga4_get_top_events',
    description: 'Get the most frequent events in GA4',
    inputSchema: {
      type: 'object',
      properties: {
        period: { type: 'string', enum: ['today', '7d', '30d', '90d', 'year'] },
        limit: { type: 'number', description: 'Max events to return' },
      },
    },
  },
  {
    name: 'ga4_get_user_metrics',
    description: 'Get user acquisition and engagement metrics',
    inputSchema: {
      type: 'object',
      properties: {
        period: { type: 'string', enum: ['today', '7d', '30d', '90d', 'year'] },
      },
    },
  },
  {
    name: 'ga4_get_page_views',
    description: 'Get page view breakdown by title or path',
    inputSchema: {
      type: 'object',
      properties: {
        period: { type: 'string', enum: ['today', '7d', '30d', '90d', 'year'] },
        dimension: { type: 'string', enum: ['pageTitle', 'pagePath', 'pagePathPlusQueryString'] },
        limit: { type: 'number' },
      },
    },
  },
  {
    name: 'ga4_get_metadata',
    description: 'Get available dimensions and metrics for the GA4 property',
    inputSchema: { type: 'object', properties: {} },
  },
  // Realtime tools
  {
    name: 'ga4_realtime_users',
    description: 'Get current active users on the site/app (real-time)',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'ga4_realtime_events',
    description: 'Get recent events from the last 30 minutes',
    inputSchema: {
      type: 'object',
      properties: {
        eventName: { type: 'string', description: 'Filter by event name' },
        limit: { type: 'number' },
      },
    },
  },
  {
    name: 'ga4_realtime_pages',
    description: 'Get pages currently being viewed by users',
    inputSchema: {
      type: 'object',
      properties: {
        limit: { type: 'number' },
      },
    },
  },
  {
    name: 'ga4_realtime_locations',
    description: 'Get locations of current active users',
    inputSchema: {
      type: 'object',
      properties: {
        granularity: { type: 'string', enum: ['country', 'city'] },
        limit: { type: 'number' },
      },
    },
  },
  {
    name: 'ga4_realtime_traffic_sources',
    description: 'Get traffic sources of current active users',
    inputSchema: {
      type: 'object',
      properties: {
        limit: { type: 'number' },
      },
    },
  },
  // Admin tools
  {
    name: 'ga4_list_custom_dimensions',
    description: 'List all custom dimensions defined in the GA4 property',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'ga4_create_custom_dimension',
    description: 'Create a new custom dimension in the GA4 property',
    inputSchema: {
      type: 'object',
      properties: {
        parameterName: { type: 'string' },
        displayName: { type: 'string' },
        description: { type: 'string' },
        scope: { type: 'string', enum: ['USER', 'EVENT', 'ITEM'] },
      },
      required: ['parameterName', 'displayName'],
    },
  },
  {
    name: 'ga4_list_custom_metrics',
    description: 'List all custom metrics defined in the GA4 property',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'ga4_list_key_events',
    description: 'List all key events (conversions) in the GA4 property',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'ga4_create_key_event',
    description: 'Register a new key event (conversion) in the GA4 property',
    inputSchema: {
      type: 'object',
      properties: {
        eventName: { type: 'string' },
        countingMethod: { type: 'string', enum: ['ONCE_PER_EVENT', 'ONCE_PER_SESSION'] },
      },
      required: ['eventName'],
    },
  },
  {
    name: 'ga4_list_audiences',
    description: 'List all audiences defined in the GA4 property',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'ga4_get_property_info',
    description: 'Get details about the GA4 property',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'ga4_list_properties',
    description: 'List all GA4 properties the service account has access to',
    inputSchema: { type: 'object', properties: {} },
  },
  // Export tools
  {
    name: 'ga4_batch_report',
    description: 'Run multiple reports in a single efficient API call',
    inputSchema: {
      type: 'object',
      properties: {
        reports: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              dimensions: { type: 'array', items: { type: 'string' } },
              metrics: { type: 'array', items: { type: 'string' } },
              startDate: { type: 'string' },
              endDate: { type: 'string' },
              limit: { type: 'number' },
            },
            required: ['name', 'dimensions', 'metrics'],
          },
        },
      },
      required: ['reports'],
    },
  },
  {
    name: 'ga4_export_csv',
    description: 'Run a report and export as CSV format',
    inputSchema: {
      type: 'object',
      properties: {
        dimensions: { type: 'array', items: { type: 'string' } },
        metrics: { type: 'array', items: { type: 'string' } },
        startDate: { type: 'string' },
        endDate: { type: 'string' },
        limit: { type: 'number' },
      },
      required: ['dimensions', 'metrics'],
    },
  },
  {
    name: 'ga4_summary_report',
    description: 'Generate a comprehensive summary report with key metrics',
    inputSchema: {
      type: 'object',
      properties: {
        period: { type: 'string', enum: ['today', '7d', '30d', '90d', 'year'] },
      },
    },
  },
  {
    name: 'ga4_compare_periods',
    description: 'Compare metrics between two time periods',
    inputSchema: {
      type: 'object',
      properties: {
        dimensions: { type: 'array', items: { type: 'string' } },
        metrics: { type: 'array', items: { type: 'string' } },
        currentPeriod: {
          type: 'object',
          properties: { startDate: { type: 'string' }, endDate: { type: 'string' } },
          required: ['startDate', 'endDate'],
        },
        previousPeriod: {
          type: 'object',
          properties: { startDate: { type: 'string' }, endDate: { type: 'string' } },
          required: ['startDate', 'endDate'],
        },
      },
      required: ['metrics', 'currentPeriod', 'previousPeriod'],
    },
  },
];

// Tool handlers
async function handleToolCall(name: string, args: Record<string, unknown>): Promise<{
  content: Array<{ type: 'text'; text: string }>;
  isError?: boolean;
}> {
  try {
    switch (name) {
      case 'ga4_run_report': {
        const { dimensions, metrics, startDate, endDate, limit } = args as {
          dimensions: string[];
          metrics: string[];
          startDate?: string;
          endDate?: string;
          limit?: number;
        };
        const request: ReportRequest = {
          dimensions: dimensions.map((name) => ({ name })),
          metrics: metrics.map((name) => ({ name })),
          dateRanges: [{ startDate: startDate || '7daysAgo', endDate: endDate || 'today' }],
          limit: limit || 100,
        };
        const response = await runReport(request);
        const records = parseReportToRecords(response);
        return {
          content: [{ type: 'text', text: JSON.stringify({ rowCount: response.rowCount, data: records }, null, 2) }],
        };
      }

      case 'ga4_get_active_users': {
        const { period = '7d' } = args as { period?: string };
        const dateRange = createDateRange(period as 'today' | '7d' | '30d' | '90d' | 'year');
        const response = await runReport({
          dimensions: [{ name: 'deviceCategory' }],
          metrics: [{ name: 'activeUsers' }, { name: 'newUsers' }],
          dateRanges: [dateRange],
        });
        const byDevice = parseReportToRecords(response);
        const totals = byDevice.reduce(
          (acc: { activeUsers: number; newUsers: number }, row) => ({
            activeUsers: acc.activeUsers + (Number(row.activeUsers) || 0),
            newUsers: acc.newUsers + (Number(row.newUsers) || 0),
          }),
          { activeUsers: 0, newUsers: 0 }
        );
        return {
          content: [{ type: 'text', text: JSON.stringify({ period, totals, byDevice }, null, 2) }],
        };
      }

      case 'ga4_get_top_events': {
        const { period = '7d', limit = 20 } = args as { period?: string; limit?: number };
        const dateRange = createDateRange(period as 'today' | '7d' | '30d' | '90d' | 'year');
        const response = await runReport({
          dimensions: [{ name: 'eventName' }],
          metrics: [{ name: 'eventCount' }, { name: 'totalUsers' }],
          dateRanges: [dateRange],
          limit,
          orderBys: [{ metric: { metricName: 'eventCount' }, desc: true }],
        });
        const events = parseReportToRecords(response);
        return {
          content: [{ type: 'text', text: JSON.stringify({ period, totalEvents: response.rowCount, events }, null, 2) }],
        };
      }

      case 'ga4_get_user_metrics': {
        const { period = '7d' } = args as { period?: string };
        const dateRange = createDateRange(period as 'today' | '7d' | '30d' | '90d' | 'year');
        const { reports } = await batchRunReports([
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
          content: [{ type: 'text', text: JSON.stringify({ period, overall: overallMetrics, acquisitionBySource }, null, 2) }],
        };
      }

      case 'ga4_get_page_views': {
        const { period = '7d', dimension = 'pageTitle', limit = 20 } = args as {
          period?: string;
          dimension?: string;
          limit?: number;
        };
        const dateRange = createDateRange(period as 'today' | '7d' | '30d' | '90d' | 'year');
        const response = await runReport({
          dimensions: [{ name: dimension }],
          metrics: [{ name: 'screenPageViews' }, { name: 'activeUsers' }, { name: 'averageSessionDuration' }],
          dateRanges: [dateRange],
          limit,
          orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
        });
        const pages = parseReportToRecords(response);
        return {
          content: [{ type: 'text', text: JSON.stringify({ period, dimension, totalPages: response.rowCount, pages }, null, 2) }],
        };
      }

      case 'ga4_get_metadata': {
        const metadata = await getMetadata();
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              dimensionCount: metadata.dimensions.length,
              metricCount: metadata.metrics.length,
              dimensions: metadata.dimensions.map((d) => ({ name: d.apiName, displayName: d.uiName, category: d.category })),
              metrics: metadata.metrics.map((m) => ({ name: m.apiName, displayName: m.uiName, type: m.type, category: m.category })),
            }, null, 2),
          }],
        };
      }

      case 'ga4_realtime_users': {
        const { activeUsers, byDevice } = await getActiveUsers();
        return {
          content: [{ type: 'text', text: JSON.stringify({ timestamp: new Date().toISOString(), totalActiveUsers: activeUsers, byDevice }, null, 2) }],
        };
      }

      case 'ga4_realtime_events': {
        const { eventName, limit } = args as { eventName?: string; limit?: number };
        const events = await getRecentEvents({ eventName, limit });
        const totalCount = events.reduce((sum, e) => sum + e.eventCount, 0);
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({ timestamp: new Date().toISOString(), period: 'last 30 minutes', totalEventCount: totalCount, filter: eventName || 'all events', events }, null, 2),
          }],
        };
      }

      case 'ga4_realtime_pages': {
        const { limit } = args as { limit?: number };
        const pages = await getCurrentPages({ limit });
        return {
          content: [{ type: 'text', text: JSON.stringify({ timestamp: new Date().toISOString(), pages }, null, 2) }],
        };
      }

      case 'ga4_realtime_locations': {
        const { granularity = 'country', limit } = args as { granularity?: 'country' | 'city'; limit?: number };
        const locations = await getUserLocations({ granularity, limit });
        return {
          content: [{ type: 'text', text: JSON.stringify({ timestamp: new Date().toISOString(), granularity, locations }, null, 2) }],
        };
      }

      case 'ga4_realtime_traffic_sources': {
        const { limit } = args as { limit?: number };
        const sources = await getTrafficSources({ limit });
        return {
          content: [{ type: 'text', text: JSON.stringify({ timestamp: new Date().toISOString(), sources }, null, 2) }],
        };
      }

      case 'ga4_list_custom_dimensions': {
        const { customDimensions } = await listCustomDimensions();
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              count: customDimensions?.length || 0,
              customDimensions: customDimensions?.map((d) => ({
                name: d.name,
                parameterName: d.parameterName,
                displayName: d.displayName,
                description: d.description,
                scope: d.scope,
              })) || [],
            }, null, 2),
          }],
        };
      }

      case 'ga4_create_custom_dimension': {
        const { parameterName, displayName, description, scope = 'EVENT' } = args as {
          parameterName: string;
          displayName: string;
          description?: string;
          scope?: DimensionScope;
        };
        const dimension = await createCustomDimension({ parameterName, displayName, description, scope });
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: true,
              message: `Custom dimension "${displayName}" created successfully`,
              dimension: { name: dimension.name, parameterName: dimension.parameterName, displayName: dimension.displayName, scope: dimension.scope },
            }, null, 2),
          }],
        };
      }

      case 'ga4_list_custom_metrics': {
        const { customMetrics } = await listCustomMetrics();
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              count: customMetrics?.length || 0,
              customMetrics: customMetrics?.map((m) => ({
                name: m.name,
                parameterName: m.parameterName,
                displayName: m.displayName,
                description: m.description,
                measurementUnit: m.measurementUnit,
              })) || [],
            }, null, 2),
          }],
        };
      }

      case 'ga4_list_key_events': {
        const { keyEvents } = await listKeyEvents();
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              count: keyEvents?.length || 0,
              keyEvents: keyEvents?.map((e) => ({
                name: e.name,
                eventName: e.eventName,
                countingMethod: e.countingMethod,
                custom: e.custom,
                deletable: e.deletable,
                createTime: e.createTime,
              })) || [],
            }, null, 2),
          }],
        };
      }

      case 'ga4_create_key_event': {
        const { eventName, countingMethod = 'ONCE_PER_EVENT' } = args as {
          eventName: string;
          countingMethod?: CountingMethod;
        };
        const keyEvent = await createKeyEvent({ eventName, countingMethod });
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: true,
              message: `Key event "${eventName}" registered as conversion`,
              keyEvent: { name: keyEvent.name, eventName: keyEvent.eventName, countingMethod: keyEvent.countingMethod },
            }, null, 2),
          }],
        };
      }

      case 'ga4_list_audiences': {
        const { audiences } = await listAudiences();
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              count: audiences?.length || 0,
              audiences: audiences?.map((a) => ({
                name: a.name,
                displayName: a.displayName,
                description: a.description,
                membershipDurationDays: a.membershipDurationDays,
                adsPersonalizationEnabled: a.adsPersonalizationEnabled,
              })) || [],
            }, null, 2),
          }],
        };
      }

      case 'ga4_get_property_info': {
        const property = await getProperty();
        const retention = await getDataRetentionSettings();
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              property: {
                name: property.name,
                displayName: property.displayName,
                timeZone: property.timeZone,
                currencyCode: property.currencyCode,
                industryCategory: property.industryCategory,
                propertyType: property.propertyType,
                serviceLevel: property.serviceLevel,
                createTime: property.createTime,
              },
              dataRetention: {
                eventDataRetention: retention.eventDataRetention,
                resetUserDataOnNewActivity: retention.resetUserDataOnNewActivity,
              },
            }, null, 2),
          }],
        };
      }

      case 'ga4_list_properties': {
        const { accountSummaries } = await listAccountSummaries();
        const properties: Array<{
          account: string;
          accountName: string;
          propertyId: string;
          propertyName: string;
          propertyType: string;
        }> = [];
        for (const account of accountSummaries || []) {
          for (const prop of account.propertySummaries || []) {
            properties.push({
              account: account.account,
              accountName: account.displayName,
              propertyId: prop.property.replace('properties/', ''),
              propertyName: prop.displayName,
              propertyType: prop.propertyType,
            });
          }
        }
        return {
          content: [{ type: 'text', text: JSON.stringify({ count: properties.length, properties }, null, 2) }],
        };
      }

      case 'ga4_batch_report': {
        const { reports } = args as {
          reports: Array<{
            name: string;
            dimensions: string[];
            metrics: string[];
            startDate?: string;
            endDate?: string;
            limit?: number;
          }>;
        };
        const requests: ReportRequest[] = reports.map((r) => ({
          dimensions: r.dimensions.map((name) => ({ name })),
          metrics: r.metrics.map((name) => ({ name })),
          dateRanges: [{ startDate: r.startDate || '7daysAgo', endDate: r.endDate || 'today' }],
          limit: r.limit || 100,
        }));
        const { reports: responses } = await batchRunReports(requests);
        const results = reports.map((config, i) => ({
          name: config.name,
          rowCount: responses[i].rowCount,
          data: parseReportToRecords(responses[i]),
        }));
        return {
          content: [{ type: 'text', text: JSON.stringify({ reportCount: results.length, reports: results }, null, 2) }],
        };
      }

      case 'ga4_export_csv': {
        const { dimensions, metrics, startDate, endDate, limit } = args as {
          dimensions: string[];
          metrics: string[];
          startDate?: string;
          endDate?: string;
          limit?: number;
        };
        const response = await runReport({
          dimensions: dimensions.map((name) => ({ name })),
          metrics: metrics.map((name) => ({ name })),
          dateRanges: [{ startDate: startDate || '7daysAgo', endDate: endDate || 'today' }],
          limit: limit || 1000,
        });
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
          content: [{ type: 'text', text: `CSV Export (${response.rowCount} rows):\n\n${csv}` }],
        };
      }

      case 'ga4_summary_report': {
        const { period = '30d' } = args as { period?: string };
        const dateRange = createDateRange(period as 'today' | '7d' | '30d' | '90d' | 'year');
        // GA4 batch limit is 5 requests, so we combine some reports
        const { reports } = await batchRunReports([
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
          {
            dimensions: [{ name: 'date' }],
            metrics: [{ name: 'activeUsers' }, { name: 'sessions' }],
            dateRanges: [dateRange],
            orderBys: [{ dimension: { dimensionName: 'date' } }],
          },
          {
            dimensions: [{ name: 'eventName' }],
            metrics: [{ name: 'eventCount' }],
            dateRanges: [dateRange],
            limit: 10,
            orderBys: [{ metric: { metricName: 'eventCount' }, desc: true }],
          },
          {
            dimensions: [{ name: 'deviceCategory' }],
            metrics: [{ name: 'activeUsers' }, { name: 'sessions' }],
            dateRanges: [dateRange],
          },
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
        const topEvents = parseReportToRecords(reports[2]);
        const devices = parseReportToRecords(reports[3]);
        const countries = parseReportToRecords(reports[4]);
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
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
                trends: { daily: dailyTrend },
                topEvents,
                demographics: { devices, countries },
              },
            }, null, 2),
          }],
        };
      }

      case 'ga4_compare_periods': {
        const { dimensions, metrics, currentPeriod, previousPeriod } = args as {
          dimensions?: string[];
          metrics: string[];
          currentPeriod: { startDate: string; endDate: string };
          previousPeriod: { startDate: string; endDate: string };
        };
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
        const calculateTotals = (data: Array<Record<string, string | number>>) => {
          const totals: Record<string, number> = {};
          for (const metric of metrics) {
            totals[metric] = data.reduce((sum, row) => sum + (Number(row[metric]) || 0), 0);
          }
          return totals;
        };
        const currentTotals = calculateTotals(currentData);
        const previousTotals = calculateTotals(previousData);
        const changes: Record<string, { current: number; previous: number; change: number; changePercent: string }> = {};
        for (const metric of metrics) {
          const current = currentTotals[metric];
          const previous = previousTotals[metric];
          const change = current - previous;
          const changePercent = previous === 0
            ? current > 0 ? '+100%' : '0%'
            : `${change >= 0 ? '+' : ''}${((change / previous) * 100).toFixed(1)}%`;
          changes[metric] = { current, previous, change, changePercent };
        }
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({ currentPeriod, previousPeriod, comparison: changes, currentData, previousData }, null, 2),
          }],
        };
      }

      default:
        return {
          isError: true,
          content: [{ type: 'text', text: `Unknown tool: ${name}` }],
        };
    }
  } catch (error) {
    return {
      isError: true,
      content: [{ type: 'text', text: `Error executing ${name}: ${(error as Error).message}` }],
    };
  }
}

function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

// Set CORS headers
function setCorsHeaders(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

// Main handler
export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);

  // Handle OPTIONS (CORS preflight)
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  // Handle GET (health check)
  if (req.method === 'GET') {
    return res.json({
      name: 'toonnotes-analytics',
      version: '1.0.0',
      status: 'healthy',
      toolCount: TOOLS.length,
      endpoints: ['POST /api/mcp'],
    });
  }

  // Handle POST (MCP requests)
  if (req.method === 'POST') {
    try {
      const body = req.body as { jsonrpc?: string; method?: string; params?: Record<string, unknown>; id?: unknown };

      // Basic validation
      if (!body.jsonrpc || body.jsonrpc !== '2.0') {
        return res.status(400).json({
          jsonrpc: '2.0',
          error: { code: -32600, message: 'Invalid Request: Not a valid JSON-RPC 2.0 request' },
          id: body.id || null,
        });
      }

      // Handle initialize
      if (body.method === 'initialize') {
        return res.json({
          jsonrpc: '2.0',
          result: {
            protocolVersion: '2024-11-05',
            capabilities: { tools: {} },
            serverInfo: { name: 'toonnotes-analytics', version: '1.0.0' },
          },
          id: body.id,
        });
      }

      // Handle tools/list
      if (body.method === 'tools/list') {
        return res.json({
          jsonrpc: '2.0',
          result: { tools: TOOLS },
          id: body.id,
        });
      }

      // Handle tools/call
      if (body.method === 'tools/call') {
        const params = body.params as { name: string; arguments?: Record<string, unknown> } | undefined;
        if (!params?.name) {
          return res.status(400).json({
            jsonrpc: '2.0',
            error: { code: -32602, message: 'Invalid params: missing tool name' },
            id: body.id,
          });
        }

        const result = await handleToolCall(params.name, params.arguments || {});
        return res.json({
          jsonrpc: '2.0',
          result,
          id: body.id,
        });
      }

      // Method not found
      return res.status(404).json({
        jsonrpc: '2.0',
        error: { code: -32601, message: `Method not found: ${body.method}` },
        id: body.id,
      });
    } catch (error) {
      return res.status(400).json({
        jsonrpc: '2.0',
        error: { code: -32700, message: `Parse error: ${(error as Error).message}` },
        id: null,
      });
    }
  }

  // Method not allowed
  return res.status(405).json({ error: 'Method not allowed' });
}

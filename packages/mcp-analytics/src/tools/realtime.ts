/**
 * MCP Real-time Tools
 *
 * Tools for monitoring real-time GA4 data:
 * - Current active users
 * - Recent events (last 30 minutes)
 * - Currently viewed pages
 * - User locations
 * - Traffic sources
 */

import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import {
  getActiveUsers,
  getRecentEvents,
  getCurrentPages,
  getUserLocations,
  getTrafficSources,
  runRealtimeReport,
} from '../api/realtime';

// ============================================
// Tool Registration
// ============================================

export function registerRealtimeTools(server: McpServer) {
  // Get current active users
  server.registerTool(
    'ga4_realtime_users',
    {
      description: 'Get current active users on the site/app (real-time)',
      inputSchema: {},
    },
    async () => {
      try {
        const { activeUsers, byDevice } = await getActiveUsers();

        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(
                {
                  timestamp: new Date().toISOString(),
                  totalActiveUsers: activeUsers,
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
              text: `Error getting real-time users: ${(error as Error).message}`,
            },
          ],
        };
      }
    }
  );

  // Get recent events
  server.registerTool(
    'ga4_realtime_events',
    {
      description: 'Get recent events from the last 30 minutes',
      inputSchema: {
        eventName: z
          .string()
          .optional()
          .describe('Filter by specific event name'),
        limit: z.number().optional().describe('Max events to return. Default: 20'),
      },
    },
    async ({ eventName, limit }: { eventName?: string; limit?: number }) => {
      try {
        const events = await getRecentEvents({ eventName, limit });

        const totalCount = events.reduce((sum, e) => sum + e.eventCount, 0);

        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(
                {
                  timestamp: new Date().toISOString(),
                  period: 'last 30 minutes',
                  totalEventCount: totalCount,
                  filter: eventName || 'all events',
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
              text: `Error getting real-time events: ${(error as Error).message}`,
            },
          ],
        };
      }
    }
  );

  // Get currently viewed pages
  server.registerTool(
    'ga4_realtime_pages',
    {
      description: 'Get pages currently being viewed by users',
      inputSchema: {
        limit: z.number().optional().describe('Max pages to return. Default: 10'),
      },
    },
    async ({ limit }: { limit?: number }) => {
      try {
        const pages = await getCurrentPages({ limit });

        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(
                {
                  timestamp: new Date().toISOString(),
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
              text: `Error getting current pages: ${(error as Error).message}`,
            },
          ],
        };
      }
    }
  );

  // Get user locations
  server.registerTool(
    'ga4_realtime_locations',
    {
      description: 'Get locations of current active users',
      inputSchema: {
        granularity: z
          .enum(['country', 'city'])
          .default('country')
          .describe('Location granularity'),
        limit: z.number().optional().describe('Max locations to return. Default: 10'),
      },
    },
    async ({ granularity, limit }: { granularity: 'country' | 'city'; limit?: number }) => {
      try {
        const locations = await getUserLocations({ granularity, limit });

        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(
                {
                  timestamp: new Date().toISOString(),
                  granularity,
                  locations,
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
              text: `Error getting user locations: ${(error as Error).message}`,
            },
          ],
        };
      }
    }
  );

  // Get traffic sources
  server.registerTool(
    'ga4_realtime_traffic_sources',
    {
      description: 'Get traffic sources of current active users',
      inputSchema: {
        limit: z.number().optional().describe('Max sources to return. Default: 10'),
      },
    },
    async ({ limit }: { limit?: number }) => {
      try {
        const sources = await getTrafficSources({ limit });

        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(
                {
                  timestamp: new Date().toISOString(),
                  sources,
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
              text: `Error getting traffic sources: ${(error as Error).message}`,
            },
          ],
        };
      }
    }
  );

  // Run custom real-time report
  server.registerTool(
    'ga4_realtime_custom',
    {
      description: 'Run a custom real-time report with specified dimensions and metrics',
      inputSchema: {
        dimensions: z
          .array(z.string())
          .describe('Dimension names (e.g., ["deviceCategory", "country"])'),
        metrics: z
          .array(z.string())
          .describe('Metric names (e.g., ["activeUsers", "eventCount"])'),
        limit: z.number().optional().describe('Max rows to return. Default: 100'),
      },
    },
    async ({ dimensions, metrics, limit }: {
      dimensions: string[];
      metrics: string[];
      limit?: number;
    }) => {
      try {
        const response = await runRealtimeReport({
          dimensions: dimensions.map((name) => ({ name })),
          metrics: metrics.map((name) => ({ name })),
          limit: limit || 100,
        });

        // Parse response into records
        const records = (response.rows || []).map((row) => {
          const record: Record<string, string | number> = {};

          row.dimensionValues.forEach((dv, i) => {
            record[response.dimensionHeaders[i].name] = dv.value;
          });

          row.metricValues.forEach((mv, i) => {
            const header = response.metricHeaders[i];
            const value = mv.value;
            if (
              header.type === 'TYPE_INTEGER' ||
              header.type === 'TYPE_FLOAT'
            ) {
              record[header.name] = parseFloat(value);
            } else {
              record[header.name] = value;
            }
          });

          return record;
        });

        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(
                {
                  timestamp: new Date().toISOString(),
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
              text: `Error running custom real-time report: ${(error as Error).message}`,
            },
          ],
        };
      }
    }
  );
}

/**
 * MCP Admin Tools
 *
 * Tools for managing GA4 configuration:
 * - Custom dimensions
 * - Custom metrics
 * - Key events (conversions)
 * - Audiences
 * - Property info
 */

import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
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
} from '../api/admin';

// ============================================
// Tool Registration
// ============================================

export function registerAdminTools(server: McpServer) {
  // ============================================
  // Custom Dimensions
  // ============================================

  server.registerTool(
    'ga4_list_custom_dimensions',
    {
      description: 'List all custom dimensions defined in the GA4 property',
      inputSchema: {},
    },
    async () => {
      try {
        const { customDimensions } = await listCustomDimensions();

        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(
                {
                  count: customDimensions?.length || 0,
                  customDimensions: customDimensions?.map((d) => ({
                    name: d.name,
                    parameterName: d.parameterName,
                    displayName: d.displayName,
                    description: d.description,
                    scope: d.scope,
                  })) || [],
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
              text: `Error listing custom dimensions: ${(error as Error).message}`,
            },
          ],
        };
      }
    }
  );

  server.registerTool(
    'ga4_create_custom_dimension',
    {
      description: 'Create a new custom dimension in the GA4 property',
      inputSchema: {
        parameterName: z
          .string()
          .describe('The parameter name (e.g., "user_subscription_tier")'),
        displayName: z
          .string()
          .describe('Human-readable display name'),
        description: z
          .string()
          .optional()
          .describe('Description of the dimension'),
        scope: z
          .enum(['USER', 'EVENT', 'ITEM'])
          .default('EVENT')
          .describe('Dimension scope: USER, EVENT, or ITEM'),
      },
    },
    async ({ parameterName, displayName, description, scope }: {
      parameterName: string;
      displayName: string;
      description?: string;
      scope: 'USER' | 'EVENT' | 'ITEM';
    }) => {
      try {
        const dimension = await createCustomDimension({
          parameterName,
          displayName,
          description,
          scope: scope as DimensionScope,
        });

        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(
                {
                  success: true,
                  message: `Custom dimension "${displayName}" created successfully`,
                  dimension: {
                    name: dimension.name,
                    parameterName: dimension.parameterName,
                    displayName: dimension.displayName,
                    scope: dimension.scope,
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
              text: `Error creating custom dimension: ${(error as Error).message}`,
            },
          ],
        };
      }
    }
  );

  // ============================================
  // Custom Metrics
  // ============================================

  server.registerTool(
    'ga4_list_custom_metrics',
    {
      description: 'List all custom metrics defined in the GA4 property',
      inputSchema: {},
    },
    async () => {
      try {
        const { customMetrics } = await listCustomMetrics();

        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(
                {
                  count: customMetrics?.length || 0,
                  customMetrics: customMetrics?.map((m) => ({
                    name: m.name,
                    parameterName: m.parameterName,
                    displayName: m.displayName,
                    description: m.description,
                    measurementUnit: m.measurementUnit,
                  })) || [],
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
              text: `Error listing custom metrics: ${(error as Error).message}`,
            },
          ],
        };
      }
    }
  );

  server.registerTool(
    'ga4_create_custom_metric',
    {
      description: 'Create a new custom metric in the GA4 property',
      inputSchema: {
        parameterName: z
          .string()
          .describe('The parameter name (e.g., "coins_spent")'),
        displayName: z
          .string()
          .describe('Human-readable display name'),
        description: z
          .string()
          .optional()
          .describe('Description of the metric'),
        measurementUnit: z
          .enum(['STANDARD', 'CURRENCY', 'FEET', 'METERS', 'KILOMETERS', 'MILES', 'MILLISECONDS', 'SECONDS', 'MINUTES', 'HOURS'])
          .default('STANDARD')
          .describe('Measurement unit for the metric'),
      },
    },
    async ({ parameterName, displayName, description, measurementUnit }: {
      parameterName: string;
      displayName: string;
      description?: string;
      measurementUnit: string;
    }) => {
      try {
        const metric = await createCustomMetric({
          parameterName,
          displayName,
          description,
          measurementUnit,
        });

        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(
                {
                  success: true,
                  message: `Custom metric "${displayName}" created successfully`,
                  metric: {
                    name: metric.name,
                    parameterName: metric.parameterName,
                    displayName: metric.displayName,
                    measurementUnit: metric.measurementUnit,
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
              text: `Error creating custom metric: ${(error as Error).message}`,
            },
          ],
        };
      }
    }
  );

  // ============================================
  // Key Events (Conversions)
  // ============================================

  server.registerTool(
    'ga4_list_key_events',
    {
      description: 'List all key events (conversions) in the GA4 property',
      inputSchema: {},
    },
    async () => {
      try {
        const { keyEvents } = await listKeyEvents();

        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(
                {
                  count: keyEvents?.length || 0,
                  keyEvents: keyEvents?.map((e) => ({
                    name: e.name,
                    eventName: e.eventName,
                    countingMethod: e.countingMethod,
                    custom: e.custom,
                    deletable: e.deletable,
                    createTime: e.createTime,
                  })) || [],
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
              text: `Error listing key events: ${(error as Error).message}`,
            },
          ],
        };
      }
    }
  );

  server.registerTool(
    'ga4_create_key_event',
    {
      description: 'Register a new key event (conversion) in the GA4 property',
      inputSchema: {
        eventName: z
          .string()
          .describe('The event name to register as a conversion (e.g., "purchase")'),
        countingMethod: z
          .enum(['ONCE_PER_EVENT', 'ONCE_PER_SESSION'])
          .default('ONCE_PER_EVENT')
          .describe('How to count the conversion'),
      },
    },
    async ({ eventName, countingMethod }: {
      eventName: string;
      countingMethod: 'ONCE_PER_EVENT' | 'ONCE_PER_SESSION';
    }) => {
      try {
        const keyEvent = await createKeyEvent({
          eventName,
          countingMethod: countingMethod as CountingMethod,
        });

        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(
                {
                  success: true,
                  message: `Key event "${eventName}" registered as conversion`,
                  keyEvent: {
                    name: keyEvent.name,
                    eventName: keyEvent.eventName,
                    countingMethod: keyEvent.countingMethod,
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
              text: `Error creating key event: ${(error as Error).message}`,
            },
          ],
        };
      }
    }
  );

  // ============================================
  // Audiences
  // ============================================

  server.registerTool(
    'ga4_list_audiences',
    {
      description: 'List all audiences defined in the GA4 property',
      inputSchema: {},
    },
    async () => {
      try {
        const { audiences } = await listAudiences();

        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(
                {
                  count: audiences?.length || 0,
                  audiences: audiences?.map((a) => ({
                    name: a.name,
                    displayName: a.displayName,
                    description: a.description,
                    membershipDurationDays: a.membershipDurationDays,
                    adsPersonalizationEnabled: a.adsPersonalizationEnabled,
                  })) || [],
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
              text: `Error listing audiences: ${(error as Error).message}`,
            },
          ],
        };
      }
    }
  );

  server.registerTool(
    'ga4_create_audience',
    {
      description: 'Create a simple audience based on an event trigger',
      inputSchema: {
        displayName: z
          .string()
          .describe('Human-readable name for the audience'),
        description: z
          .string()
          .optional()
          .describe('Description of the audience'),
        membershipDurationDays: z
          .number()
          .default(30)
          .describe('How long users remain in the audience (days)'),
        triggerEventName: z
          .string()
          .optional()
          .describe('Event that triggers audience membership'),
      },
    },
    async ({ displayName, description, membershipDurationDays, triggerEventName }: {
      displayName: string;
      description?: string;
      membershipDurationDays: number;
      triggerEventName?: string;
    }) => {
      try {
        const audience = await createAudience({
          displayName,
          description,
          membershipDurationDays,
          eventTrigger: triggerEventName
            ? { eventName: triggerEventName }
            : undefined,
        });

        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(
                {
                  success: true,
                  message: `Audience "${displayName}" created successfully`,
                  audience: {
                    name: audience.name,
                    displayName: audience.displayName,
                    membershipDurationDays: audience.membershipDurationDays,
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
              text: `Error creating audience: ${(error as Error).message}`,
            },
          ],
        };
      }
    }
  );

  // ============================================
  // Property Info
  // ============================================

  server.registerTool(
    'ga4_get_property_info',
    {
      description: 'Get details about the GA4 property',
      inputSchema: {},
    },
    async () => {
      try {
        const property = await getProperty();
        const retention = await getDataRetentionSettings();

        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(
                {
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
              text: `Error getting property info: ${(error as Error).message}`,
            },
          ],
        };
      }
    }
  );

  server.registerTool(
    'ga4_list_properties',
    {
      description: 'List all GA4 properties the service account has access to',
      inputSchema: {},
    },
    async () => {
      try {
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
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(
                {
                  count: properties.length,
                  properties,
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
              text: `Error listing properties: ${(error as Error).message}`,
            },
          ],
        };
      }
    }
  );
}

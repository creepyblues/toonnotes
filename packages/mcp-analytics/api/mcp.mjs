// Bundled by esbuild - do not edit manually

// src/auth/google.ts
import { JWT } from "google-auth-library";
var GA4_SCOPES = [
  "https://www.googleapis.com/auth/analytics.readonly",
  // Data API read
  "https://www.googleapis.com/auth/analytics.edit"
  // Admin API write
];
var jwtClient = null;
function getServiceAccountCredentials() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const keyBase64 = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!email || !keyBase64) {
    throw new Error(
      "Missing Google service account credentials. Set GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_SERVICE_ACCOUNT_KEY environment variables."
    );
  }
  const privateKey = Buffer.from(keyBase64, "base64").toString("utf-8");
  return { email, privateKey };
}
function getJwtClient() {
  if (jwtClient) {
    return jwtClient;
  }
  const { email, privateKey } = getServiceAccountCredentials();
  jwtClient = new JWT({
    email,
    key: privateKey,
    scopes: GA4_SCOPES
  });
  return jwtClient;
}
async function getAccessToken() {
  const client = getJwtClient();
  const { token } = await client.getAccessToken();
  if (!token) {
    throw new Error("Failed to obtain access token from Google");
  }
  return token;
}
async function makeAuthenticatedRequest(url, options = {}) {
  const token = await getAccessToken();
  const { method = "GET", body } = options;
  const response = await fetch(url, {
    method,
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: body ? JSON.stringify(body) : void 0
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Google API error (${response.status}): ${errorText}`);
  }
  return response.json();
}
function getPropertyId() {
  const propertyId = process.env.GA4_PROPERTY_ID;
  if (!propertyId) {
    throw new Error(
      "Missing GA4 property ID. Set GA4_PROPERTY_ID environment variable."
    );
  }
  return propertyId;
}
function getPropertyPath() {
  const propertyId = getPropertyId();
  return `properties/${propertyId}`;
}

// src/api/data.ts
var DATA_API_BASE = "https://analyticsdata.googleapis.com/v1beta";
async function runReport(request) {
  const propertyPath = getPropertyPath();
  const url = `${DATA_API_BASE}/${propertyPath}:runReport`;
  return makeAuthenticatedRequest(url, {
    method: "POST",
    body: {
      ...request,
      // Ensure dateRanges has a default if not provided
      dateRanges: request.dateRanges || [{ startDate: "7daysAgo", endDate: "today" }]
    }
  });
}
async function batchRunReports(requests) {
  const propertyPath = getPropertyPath();
  const url = `${DATA_API_BASE}/${propertyPath}:batchRunReports`;
  return makeAuthenticatedRequest(url, {
    method: "POST",
    body: {
      requests: requests.map((req) => ({
        ...req,
        dateRanges: req.dateRanges || [{ startDate: "7daysAgo", endDate: "today" }]
      }))
    }
  });
}
async function getMetadata() {
  const propertyPath = getPropertyPath();
  const url = `${DATA_API_BASE}/${propertyPath}/metadata`;
  return makeAuthenticatedRequest(url);
}
function parseReportToRecords(response) {
  if (!response) {
    return [];
  }
  const dimensionNames = (response.dimensionHeaders || []).map((h) => h.name);
  const metricNames = (response.metricHeaders || []).map((h) => h.name);
  const metricTypes = (response.metricHeaders || []).map((h) => h.type);
  return (response.rows || []).map((row) => {
    const record = {};
    (row.dimensionValues || []).forEach((dv, i) => {
      if (dimensionNames[i]) {
        record[dimensionNames[i]] = dv.value;
      }
    });
    (row.metricValues || []).forEach((mv, i) => {
      const value = mv.value;
      const type = metricTypes[i];
      if (metricNames[i]) {
        if (type === "TYPE_INTEGER" || type === "TYPE_FLOAT" || type === "TYPE_CURRENCY") {
          record[metricNames[i]] = parseFloat(value);
        } else {
          record[metricNames[i]] = value;
        }
      }
    });
    return record;
  });
}
function createDateRange(period) {
  switch (period) {
    case "today":
      return { startDate: "today", endDate: "today" };
    case "7d":
      return { startDate: "7daysAgo", endDate: "today" };
    case "30d":
      return { startDate: "30daysAgo", endDate: "today" };
    case "90d":
      return { startDate: "90daysAgo", endDate: "today" };
    case "year":
      return { startDate: "365daysAgo", endDate: "today" };
    default:
      return { startDate: "7daysAgo", endDate: "today" };
  }
}

// src/api/realtime.ts
var DATA_API_BASE2 = "https://analyticsdata.googleapis.com/v1beta";
async function runRealtimeReport(request) {
  const propertyPath = getPropertyPath();
  const url = `${DATA_API_BASE2}/${propertyPath}:runRealtimeReport`;
  return makeAuthenticatedRequest(url, {
    method: "POST",
    body: {
      ...request,
      // Default to last 30 minutes if no range specified
      minuteRanges: request.minuteRanges || [
        { startMinutesAgo: 29, endMinutesAgo: 0 }
      ]
    }
  });
}
async function getActiveUsers() {
  const response = await runRealtimeReport({
    dimensions: [{ name: "deviceCategory" }],
    metrics: [{ name: "activeUsers" }]
  });
  let total = 0;
  const byDevice = {};
  for (const row of response.rows || []) {
    const device = row.dimensionValues[0]?.value || "unknown";
    const users = parseInt(row.metricValues[0]?.value || "0", 10);
    byDevice[device] = users;
    total += users;
  }
  return { activeUsers: total, byDevice };
}
async function getRecentEvents(options = {}) {
  const request = {
    dimensions: [{ name: "eventName" }],
    metrics: [{ name: "eventCount" }],
    limit: options.limit || 20
  };
  if (options.eventName) {
    request.dimensionFilter = {
      filter: {
        fieldName: "eventName",
        stringFilter: {
          matchType: "EXACT",
          value: options.eventName
        }
      }
    };
  }
  const response = await runRealtimeReport(request);
  return (response.rows || []).map((row) => ({
    eventName: row.dimensionValues[0]?.value || "unknown",
    eventCount: parseInt(row.metricValues[0]?.value || "0", 10)
  }));
}
async function getCurrentPages(options = {}) {
  const response = await runRealtimeReport({
    dimensions: [{ name: "pageTitle" }, { name: "pagePath" }],
    metrics: [{ name: "activeUsers" }],
    limit: options.limit || 10
  });
  return (response.rows || []).map((row) => ({
    pageTitle: row.dimensionValues[0]?.value || "(not set)",
    pagePath: row.dimensionValues[1]?.value || "/",
    activeUsers: parseInt(row.metricValues[0]?.value || "0", 10)
  }));
}
async function getUserLocations(options = {}) {
  const dimensionName = options.granularity === "city" ? "city" : "country";
  const response = await runRealtimeReport({
    dimensions: [{ name: dimensionName }],
    metrics: [{ name: "activeUsers" }],
    limit: options.limit || 10
  });
  return (response.rows || []).map((row) => ({
    location: row.dimensionValues[0]?.value || "(not set)",
    activeUsers: parseInt(row.metricValues[0]?.value || "0", 10)
  }));
}
async function getTrafficSources(options = {}) {
  const response = await runRealtimeReport({
    dimensions: [
      { name: "sessionSource" },
      { name: "sessionMedium" }
    ],
    metrics: [{ name: "activeUsers" }],
    limit: options.limit || 10
  });
  return (response.rows || []).map((row) => ({
    source: row.dimensionValues[0]?.value || "(direct)",
    medium: row.dimensionValues[1]?.value || "(none)",
    activeUsers: parseInt(row.metricValues[0]?.value || "0", 10)
  }));
}

// src/api/admin.ts
var ADMIN_API_BASE = "https://analyticsadmin.googleapis.com/v1beta";
async function listCustomDimensions() {
  const propertyPath = getPropertyPath();
  const url = `${ADMIN_API_BASE}/${propertyPath}/customDimensions`;
  return makeAuthenticatedRequest(url);
}
async function createCustomDimension(data) {
  const propertyPath = getPropertyPath();
  const url = `${ADMIN_API_BASE}/${propertyPath}/customDimensions`;
  return makeAuthenticatedRequest(url, {
    method: "POST",
    body: {
      parameterName: data.parameterName,
      displayName: data.displayName,
      description: data.description || "",
      scope: data.scope
    }
  });
}
async function listCustomMetrics() {
  const propertyPath = getPropertyPath();
  const url = `${ADMIN_API_BASE}/${propertyPath}/customMetrics`;
  return makeAuthenticatedRequest(url);
}
async function listKeyEvents() {
  const propertyPath = getPropertyPath();
  const url = `${ADMIN_API_BASE}/${propertyPath}/keyEvents`;
  return makeAuthenticatedRequest(url);
}
async function createKeyEvent(data) {
  const propertyPath = getPropertyPath();
  const url = `${ADMIN_API_BASE}/${propertyPath}/keyEvents`;
  return makeAuthenticatedRequest(url, {
    method: "POST",
    body: {
      eventName: data.eventName,
      countingMethod: data.countingMethod || "ONCE_PER_EVENT",
      defaultValue: data.defaultValue
    }
  });
}
async function listAudiences() {
  const propertyPath = getPropertyPath();
  const url = `${ADMIN_API_BASE}/${propertyPath}/audiences`;
  return makeAuthenticatedRequest(url);
}
async function getProperty() {
  const propertyPath = getPropertyPath();
  const url = `${ADMIN_API_BASE}/${propertyPath}`;
  return makeAuthenticatedRequest(url);
}
async function listAccountSummaries() {
  const url = `${ADMIN_API_BASE}/accountSummaries`;
  return makeAuthenticatedRequest(url);
}
async function getDataRetentionSettings() {
  const propertyPath = getPropertyPath();
  const url = `${ADMIN_API_BASE}/${propertyPath}/dataRetentionSettings`;
  return makeAuthenticatedRequest(url);
}

// src/api-entry.ts
var TOOLS = [
  // Query tools
  {
    name: "ga4_run_report",
    description: "Run a custom GA4 report with specified dimensions, metrics, and filters",
    inputSchema: {
      type: "object",
      properties: {
        dimensions: { type: "array", items: { type: "string" }, description: "Dimension names" },
        metrics: { type: "array", items: { type: "string" }, description: "Metric names" },
        startDate: { type: "string", description: 'Start date (YYYY-MM-DD or "7daysAgo")' },
        endDate: { type: "string", description: 'End date (YYYY-MM-DD or "today")' },
        limit: { type: "number", description: "Max rows to return" }
      },
      required: ["dimensions", "metrics"]
    }
  },
  {
    name: "ga4_get_active_users",
    description: "Get active user counts for a time period, broken down by device",
    inputSchema: {
      type: "object",
      properties: {
        period: { type: "string", enum: ["today", "7d", "30d", "90d", "year"], description: "Time period" }
      }
    }
  },
  {
    name: "ga4_get_top_events",
    description: "Get the most frequent events in GA4",
    inputSchema: {
      type: "object",
      properties: {
        period: { type: "string", enum: ["today", "7d", "30d", "90d", "year"] },
        limit: { type: "number", description: "Max events to return" }
      }
    }
  },
  {
    name: "ga4_get_user_metrics",
    description: "Get user acquisition and engagement metrics",
    inputSchema: {
      type: "object",
      properties: {
        period: { type: "string", enum: ["today", "7d", "30d", "90d", "year"] }
      }
    }
  },
  {
    name: "ga4_get_page_views",
    description: "Get page view breakdown by title or path",
    inputSchema: {
      type: "object",
      properties: {
        period: { type: "string", enum: ["today", "7d", "30d", "90d", "year"] },
        dimension: { type: "string", enum: ["pageTitle", "pagePath", "pagePathPlusQueryString"] },
        limit: { type: "number" }
      }
    }
  },
  {
    name: "ga4_get_metadata",
    description: "Get available dimensions and metrics for the GA4 property",
    inputSchema: { type: "object", properties: {} }
  },
  // Realtime tools
  {
    name: "ga4_realtime_users",
    description: "Get current active users on the site/app (real-time)",
    inputSchema: { type: "object", properties: {} }
  },
  {
    name: "ga4_realtime_events",
    description: "Get recent events from the last 30 minutes",
    inputSchema: {
      type: "object",
      properties: {
        eventName: { type: "string", description: "Filter by event name" },
        limit: { type: "number" }
      }
    }
  },
  {
    name: "ga4_realtime_pages",
    description: "Get pages currently being viewed by users",
    inputSchema: {
      type: "object",
      properties: {
        limit: { type: "number" }
      }
    }
  },
  {
    name: "ga4_realtime_locations",
    description: "Get locations of current active users",
    inputSchema: {
      type: "object",
      properties: {
        granularity: { type: "string", enum: ["country", "city"] },
        limit: { type: "number" }
      }
    }
  },
  {
    name: "ga4_realtime_traffic_sources",
    description: "Get traffic sources of current active users",
    inputSchema: {
      type: "object",
      properties: {
        limit: { type: "number" }
      }
    }
  },
  // Admin tools
  {
    name: "ga4_list_custom_dimensions",
    description: "List all custom dimensions defined in the GA4 property",
    inputSchema: { type: "object", properties: {} }
  },
  {
    name: "ga4_create_custom_dimension",
    description: "Create a new custom dimension in the GA4 property",
    inputSchema: {
      type: "object",
      properties: {
        parameterName: { type: "string" },
        displayName: { type: "string" },
        description: { type: "string" },
        scope: { type: "string", enum: ["USER", "EVENT", "ITEM"] }
      },
      required: ["parameterName", "displayName"]
    }
  },
  {
    name: "ga4_list_custom_metrics",
    description: "List all custom metrics defined in the GA4 property",
    inputSchema: { type: "object", properties: {} }
  },
  {
    name: "ga4_list_key_events",
    description: "List all key events (conversions) in the GA4 property",
    inputSchema: { type: "object", properties: {} }
  },
  {
    name: "ga4_create_key_event",
    description: "Register a new key event (conversion) in the GA4 property",
    inputSchema: {
      type: "object",
      properties: {
        eventName: { type: "string" },
        countingMethod: { type: "string", enum: ["ONCE_PER_EVENT", "ONCE_PER_SESSION"] }
      },
      required: ["eventName"]
    }
  },
  {
    name: "ga4_list_audiences",
    description: "List all audiences defined in the GA4 property",
    inputSchema: { type: "object", properties: {} }
  },
  {
    name: "ga4_get_property_info",
    description: "Get details about the GA4 property",
    inputSchema: { type: "object", properties: {} }
  },
  {
    name: "ga4_list_properties",
    description: "List all GA4 properties the service account has access to",
    inputSchema: { type: "object", properties: {} }
  },
  // Export tools
  {
    name: "ga4_batch_report",
    description: "Run multiple reports in a single efficient API call",
    inputSchema: {
      type: "object",
      properties: {
        reports: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              dimensions: { type: "array", items: { type: "string" } },
              metrics: { type: "array", items: { type: "string" } },
              startDate: { type: "string" },
              endDate: { type: "string" },
              limit: { type: "number" }
            },
            required: ["name", "dimensions", "metrics"]
          }
        }
      },
      required: ["reports"]
    }
  },
  {
    name: "ga4_export_csv",
    description: "Run a report and export as CSV format",
    inputSchema: {
      type: "object",
      properties: {
        dimensions: { type: "array", items: { type: "string" } },
        metrics: { type: "array", items: { type: "string" } },
        startDate: { type: "string" },
        endDate: { type: "string" },
        limit: { type: "number" }
      },
      required: ["dimensions", "metrics"]
    }
  },
  {
    name: "ga4_summary_report",
    description: "Generate a comprehensive summary report with key metrics",
    inputSchema: {
      type: "object",
      properties: {
        period: { type: "string", enum: ["today", "7d", "30d", "90d", "year"] }
      }
    }
  },
  {
    name: "ga4_compare_periods",
    description: "Compare metrics between two time periods",
    inputSchema: {
      type: "object",
      properties: {
        dimensions: { type: "array", items: { type: "string" } },
        metrics: { type: "array", items: { type: "string" } },
        currentPeriod: {
          type: "object",
          properties: { startDate: { type: "string" }, endDate: { type: "string" } },
          required: ["startDate", "endDate"]
        },
        previousPeriod: {
          type: "object",
          properties: { startDate: { type: "string" }, endDate: { type: "string" } },
          required: ["startDate", "endDate"]
        }
      },
      required: ["metrics", "currentPeriod", "previousPeriod"]
    }
  }
];
async function handleToolCall(name, args) {
  try {
    switch (name) {
      case "ga4_run_report": {
        const { dimensions, metrics, startDate, endDate, limit } = args;
        const request = {
          dimensions: dimensions.map((name2) => ({ name: name2 })),
          metrics: metrics.map((name2) => ({ name: name2 })),
          dateRanges: [{ startDate: startDate || "7daysAgo", endDate: endDate || "today" }],
          limit: limit || 100
        };
        const response = await runReport(request);
        const records = parseReportToRecords(response);
        return {
          content: [{ type: "text", text: JSON.stringify({ rowCount: response.rowCount, data: records }, null, 2) }]
        };
      }
      case "ga4_get_active_users": {
        const { period = "7d" } = args;
        const dateRange = createDateRange(period);
        const response = await runReport({
          dimensions: [{ name: "deviceCategory" }],
          metrics: [{ name: "activeUsers" }, { name: "newUsers" }],
          dateRanges: [dateRange]
        });
        const byDevice = parseReportToRecords(response);
        const totals = byDevice.reduce(
          (acc, row) => ({
            activeUsers: acc.activeUsers + (Number(row.activeUsers) || 0),
            newUsers: acc.newUsers + (Number(row.newUsers) || 0)
          }),
          { activeUsers: 0, newUsers: 0 }
        );
        return {
          content: [{ type: "text", text: JSON.stringify({ period, totals, byDevice }, null, 2) }]
        };
      }
      case "ga4_get_top_events": {
        const { period = "7d", limit = 20 } = args;
        const dateRange = createDateRange(period);
        const response = await runReport({
          dimensions: [{ name: "eventName" }],
          metrics: [{ name: "eventCount" }, { name: "totalUsers" }],
          dateRanges: [dateRange],
          limit,
          orderBys: [{ metric: { metricName: "eventCount" }, desc: true }]
        });
        const events = parseReportToRecords(response);
        return {
          content: [{ type: "text", text: JSON.stringify({ period, totalEvents: response.rowCount, events }, null, 2) }]
        };
      }
      case "ga4_get_user_metrics": {
        const { period = "7d" } = args;
        const dateRange = createDateRange(period);
        const { reports } = await batchRunReports([
          {
            metrics: [
              { name: "activeUsers" },
              { name: "newUsers" },
              { name: "sessions" },
              { name: "engagedSessions" },
              { name: "averageSessionDuration" },
              { name: "screenPageViews" }
            ],
            dateRanges: [dateRange]
          },
          {
            dimensions: [{ name: "sessionSource" }],
            metrics: [{ name: "sessions" }, { name: "newUsers" }],
            dateRanges: [dateRange],
            limit: 10
          }
        ]);
        const overallMetrics = parseReportToRecords(reports[0])[0] || {};
        const acquisitionBySource = parseReportToRecords(reports[1]);
        return {
          content: [{ type: "text", text: JSON.stringify({ period, overall: overallMetrics, acquisitionBySource }, null, 2) }]
        };
      }
      case "ga4_get_page_views": {
        const { period = "7d", dimension = "pageTitle", limit = 20 } = args;
        const dateRange = createDateRange(period);
        const response = await runReport({
          dimensions: [{ name: dimension }],
          metrics: [{ name: "screenPageViews" }, { name: "activeUsers" }, { name: "averageSessionDuration" }],
          dateRanges: [dateRange],
          limit,
          orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }]
        });
        const pages = parseReportToRecords(response);
        return {
          content: [{ type: "text", text: JSON.stringify({ period, dimension, totalPages: response.rowCount, pages }, null, 2) }]
        };
      }
      case "ga4_get_metadata": {
        const metadata = await getMetadata();
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              dimensionCount: metadata.dimensions.length,
              metricCount: metadata.metrics.length,
              dimensions: metadata.dimensions.map((d) => ({ name: d.apiName, displayName: d.uiName, category: d.category })),
              metrics: metadata.metrics.map((m) => ({ name: m.apiName, displayName: m.uiName, type: m.type, category: m.category }))
            }, null, 2)
          }]
        };
      }
      case "ga4_realtime_users": {
        const { activeUsers, byDevice } = await getActiveUsers();
        return {
          content: [{ type: "text", text: JSON.stringify({ timestamp: (/* @__PURE__ */ new Date()).toISOString(), totalActiveUsers: activeUsers, byDevice }, null, 2) }]
        };
      }
      case "ga4_realtime_events": {
        const { eventName, limit } = args;
        const events = await getRecentEvents({ eventName, limit });
        const totalCount = events.reduce((sum, e) => sum + e.eventCount, 0);
        return {
          content: [{
            type: "text",
            text: JSON.stringify({ timestamp: (/* @__PURE__ */ new Date()).toISOString(), period: "last 30 minutes", totalEventCount: totalCount, filter: eventName || "all events", events }, null, 2)
          }]
        };
      }
      case "ga4_realtime_pages": {
        const { limit } = args;
        const pages = await getCurrentPages({ limit });
        return {
          content: [{ type: "text", text: JSON.stringify({ timestamp: (/* @__PURE__ */ new Date()).toISOString(), pages }, null, 2) }]
        };
      }
      case "ga4_realtime_locations": {
        const { granularity = "country", limit } = args;
        const locations = await getUserLocations({ granularity, limit });
        return {
          content: [{ type: "text", text: JSON.stringify({ timestamp: (/* @__PURE__ */ new Date()).toISOString(), granularity, locations }, null, 2) }]
        };
      }
      case "ga4_realtime_traffic_sources": {
        const { limit } = args;
        const sources = await getTrafficSources({ limit });
        return {
          content: [{ type: "text", text: JSON.stringify({ timestamp: (/* @__PURE__ */ new Date()).toISOString(), sources }, null, 2) }]
        };
      }
      case "ga4_list_custom_dimensions": {
        const { customDimensions } = await listCustomDimensions();
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              count: customDimensions?.length || 0,
              customDimensions: customDimensions?.map((d) => ({
                name: d.name,
                parameterName: d.parameterName,
                displayName: d.displayName,
                description: d.description,
                scope: d.scope
              })) || []
            }, null, 2)
          }]
        };
      }
      case "ga4_create_custom_dimension": {
        const { parameterName, displayName, description, scope = "EVENT" } = args;
        const dimension = await createCustomDimension({ parameterName, displayName, description, scope });
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              success: true,
              message: `Custom dimension "${displayName}" created successfully`,
              dimension: { name: dimension.name, parameterName: dimension.parameterName, displayName: dimension.displayName, scope: dimension.scope }
            }, null, 2)
          }]
        };
      }
      case "ga4_list_custom_metrics": {
        const { customMetrics } = await listCustomMetrics();
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              count: customMetrics?.length || 0,
              customMetrics: customMetrics?.map((m) => ({
                name: m.name,
                parameterName: m.parameterName,
                displayName: m.displayName,
                description: m.description,
                measurementUnit: m.measurementUnit
              })) || []
            }, null, 2)
          }]
        };
      }
      case "ga4_list_key_events": {
        const { keyEvents } = await listKeyEvents();
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              count: keyEvents?.length || 0,
              keyEvents: keyEvents?.map((e) => ({
                name: e.name,
                eventName: e.eventName,
                countingMethod: e.countingMethod,
                custom: e.custom,
                deletable: e.deletable,
                createTime: e.createTime
              })) || []
            }, null, 2)
          }]
        };
      }
      case "ga4_create_key_event": {
        const { eventName, countingMethod = "ONCE_PER_EVENT" } = args;
        const keyEvent = await createKeyEvent({ eventName, countingMethod });
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              success: true,
              message: `Key event "${eventName}" registered as conversion`,
              keyEvent: { name: keyEvent.name, eventName: keyEvent.eventName, countingMethod: keyEvent.countingMethod }
            }, null, 2)
          }]
        };
      }
      case "ga4_list_audiences": {
        const { audiences } = await listAudiences();
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              count: audiences?.length || 0,
              audiences: audiences?.map((a) => ({
                name: a.name,
                displayName: a.displayName,
                description: a.description,
                membershipDurationDays: a.membershipDurationDays,
                adsPersonalizationEnabled: a.adsPersonalizationEnabled
              })) || []
            }, null, 2)
          }]
        };
      }
      case "ga4_get_property_info": {
        const property = await getProperty();
        const retention = await getDataRetentionSettings();
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              property: {
                name: property.name,
                displayName: property.displayName,
                timeZone: property.timeZone,
                currencyCode: property.currencyCode,
                industryCategory: property.industryCategory,
                propertyType: property.propertyType,
                serviceLevel: property.serviceLevel,
                createTime: property.createTime
              },
              dataRetention: {
                eventDataRetention: retention.eventDataRetention,
                resetUserDataOnNewActivity: retention.resetUserDataOnNewActivity
              }
            }, null, 2)
          }]
        };
      }
      case "ga4_list_properties": {
        const { accountSummaries } = await listAccountSummaries();
        const properties = [];
        for (const account of accountSummaries || []) {
          for (const prop of account.propertySummaries || []) {
            properties.push({
              account: account.account,
              accountName: account.displayName,
              propertyId: prop.property.replace("properties/", ""),
              propertyName: prop.displayName,
              propertyType: prop.propertyType
            });
          }
        }
        return {
          content: [{ type: "text", text: JSON.stringify({ count: properties.length, properties }, null, 2) }]
        };
      }
      case "ga4_batch_report": {
        const { reports } = args;
        const requests = reports.map((r) => ({
          dimensions: r.dimensions.map((name2) => ({ name: name2 })),
          metrics: r.metrics.map((name2) => ({ name: name2 })),
          dateRanges: [{ startDate: r.startDate || "7daysAgo", endDate: r.endDate || "today" }],
          limit: r.limit || 100
        }));
        const { reports: responses } = await batchRunReports(requests);
        const results = reports.map((config, i) => ({
          name: config.name,
          rowCount: responses[i].rowCount,
          data: parseReportToRecords(responses[i])
        }));
        return {
          content: [{ type: "text", text: JSON.stringify({ reportCount: results.length, reports: results }, null, 2) }]
        };
      }
      case "ga4_export_csv": {
        const { dimensions, metrics, startDate, endDate, limit } = args;
        const response = await runReport({
          dimensions: dimensions.map((name2) => ({ name: name2 })),
          metrics: metrics.map((name2) => ({ name: name2 })),
          dateRanges: [{ startDate: startDate || "7daysAgo", endDate: endDate || "today" }],
          limit: limit || 1e3
        });
        const headers = [
          ...response.dimensionHeaders.map((h) => h.name),
          ...response.metricHeaders.map((h) => h.name)
        ];
        const rows = (response.rows || []).map((row) => {
          const values = [
            ...row.dimensionValues.map((v) => escapeCSV(v.value)),
            ...row.metricValues.map((v) => v.value)
          ];
          return values.join(",");
        });
        const csv = [headers.join(","), ...rows].join("\n");
        return {
          content: [{ type: "text", text: `CSV Export (${response.rowCount} rows):

${csv}` }]
        };
      }
      case "ga4_summary_report": {
        const { period = "30d" } = args;
        const dateRange = createDateRange(period);
        const { reports } = await batchRunReports([
          {
            metrics: [
              { name: "activeUsers" },
              { name: "newUsers" },
              { name: "sessions" },
              { name: "engagedSessions" },
              { name: "screenPageViews" },
              { name: "averageSessionDuration" },
              { name: "eventCount" }
            ],
            dateRanges: [dateRange]
          },
          {
            dimensions: [{ name: "date" }],
            metrics: [{ name: "activeUsers" }, { name: "sessions" }],
            dateRanges: [dateRange],
            orderBys: [{ dimension: { dimensionName: "date" } }]
          },
          {
            dimensions: [{ name: "eventName" }],
            metrics: [{ name: "eventCount" }],
            dateRanges: [dateRange],
            limit: 10,
            orderBys: [{ metric: { metricName: "eventCount" }, desc: true }]
          },
          {
            dimensions: [{ name: "deviceCategory" }],
            metrics: [{ name: "activeUsers" }, { name: "sessions" }],
            dateRanges: [dateRange]
          },
          {
            dimensions: [{ name: "country" }],
            metrics: [{ name: "activeUsers" }],
            dateRanges: [dateRange],
            limit: 10,
            orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }]
          }
        ]);
        const overall = parseReportToRecords(reports[0])[0] || {};
        const dailyTrend = parseReportToRecords(reports[1]);
        const topEvents = parseReportToRecords(reports[2]);
        const devices = parseReportToRecords(reports[3]);
        const countries = parseReportToRecords(reports[4]);
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              period,
              generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
              summary: {
                overall: {
                  activeUsers: overall.activeUsers,
                  newUsers: overall.newUsers,
                  sessions: overall.sessions,
                  engagedSessions: overall.engagedSessions,
                  pageViews: overall.screenPageViews,
                  avgSessionDuration: overall.averageSessionDuration,
                  totalEvents: overall.eventCount
                },
                trends: { daily: dailyTrend },
                topEvents,
                demographics: { devices, countries }
              }
            }, null, 2)
          }]
        };
      }
      case "ga4_compare_periods": {
        const { dimensions, metrics, currentPeriod, previousPeriod } = args;
        const requests = [
          {
            dimensions: dimensions?.map((name2) => ({ name: name2 })),
            metrics: metrics.map((name2) => ({ name: name2 })),
            dateRanges: [currentPeriod],
            limit: 100
          },
          {
            dimensions: dimensions?.map((name2) => ({ name: name2 })),
            metrics: metrics.map((name2) => ({ name: name2 })),
            dateRanges: [previousPeriod],
            limit: 100
          }
        ];
        const { reports } = await batchRunReports(requests);
        const currentData = parseReportToRecords(reports[0]);
        const previousData = parseReportToRecords(reports[1]);
        const calculateTotals = (data) => {
          const totals = {};
          for (const metric of metrics) {
            totals[metric] = data.reduce((sum, row) => sum + (Number(row[metric]) || 0), 0);
          }
          return totals;
        };
        const currentTotals = calculateTotals(currentData);
        const previousTotals = calculateTotals(previousData);
        const changes = {};
        for (const metric of metrics) {
          const current = currentTotals[metric];
          const previous = previousTotals[metric];
          const change = current - previous;
          const changePercent = previous === 0 ? current > 0 ? "+100%" : "0%" : `${change >= 0 ? "+" : ""}${(change / previous * 100).toFixed(1)}%`;
          changes[metric] = { current, previous, change, changePercent };
        }
        return {
          content: [{
            type: "text",
            text: JSON.stringify({ currentPeriod, previousPeriod, comparison: changes, currentData, previousData }, null, 2)
          }]
        };
      }
      default:
        return {
          isError: true,
          content: [{ type: "text", text: `Unknown tool: ${name}` }]
        };
    }
  } catch (error) {
    return {
      isError: true,
      content: [{ type: "text", text: `Error executing ${name}: ${error.message}` }]
    };
  }
}
function escapeCSV(value) {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
function setCorsHeaders(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}
async function handler(req, res) {
  setCorsHeaders(res);
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }
  if (req.method === "GET") {
    return res.json({
      name: "toonnotes-analytics",
      version: "1.0.0",
      status: "healthy",
      toolCount: TOOLS.length,
      endpoints: ["POST /api/mcp"]
    });
  }
  if (req.method === "POST") {
    try {
      const body = req.body;
      if (!body.jsonrpc || body.jsonrpc !== "2.0") {
        return res.status(400).json({
          jsonrpc: "2.0",
          error: { code: -32600, message: "Invalid Request: Not a valid JSON-RPC 2.0 request" },
          id: body.id || null
        });
      }
      if (body.method === "initialize") {
        return res.json({
          jsonrpc: "2.0",
          result: {
            protocolVersion: "2024-11-05",
            capabilities: { tools: {} },
            serverInfo: { name: "toonnotes-analytics", version: "1.0.0" }
          },
          id: body.id
        });
      }
      if (body.method === "tools/list") {
        return res.json({
          jsonrpc: "2.0",
          result: { tools: TOOLS },
          id: body.id
        });
      }
      if (body.method === "tools/call") {
        const params = body.params;
        if (!params?.name) {
          return res.status(400).json({
            jsonrpc: "2.0",
            error: { code: -32602, message: "Invalid params: missing tool name" },
            id: body.id
          });
        }
        const result = await handleToolCall(params.name, params.arguments || {});
        return res.json({
          jsonrpc: "2.0",
          result,
          id: body.id
        });
      }
      return res.status(404).json({
        jsonrpc: "2.0",
        error: { code: -32601, message: `Method not found: ${body.method}` },
        id: body.id
      });
    } catch (error) {
      return res.status(400).json({
        jsonrpc: "2.0",
        error: { code: -32700, message: `Parse error: ${error.message}` },
        id: null
      });
    }
  }
  return res.status(405).json({ error: "Method not allowed" });
}
export {
  handler as default
};

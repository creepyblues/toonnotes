/**
 * GA4 Admin API Client
 *
 * Provides methods to manage GA4 configuration:
 * - Custom dimensions
 * - Custom metrics
 * - Key events (conversions)
 * - Audiences
 * - Property info
 *
 * API Reference: https://developers.google.com/analytics/devguides/config/admin/v1
 */

import { makeAuthenticatedRequest, getPropertyPath } from '../auth/google';

const ADMIN_API_BASE = 'https://analyticsadmin.googleapis.com/v1beta';

// ============================================
// Types
// ============================================

export type DimensionScope = 'USER' | 'EVENT' | 'ITEM';
export type MetricScope = 'EVENT';
export type CountingMethod = 'ONCE_PER_EVENT' | 'ONCE_PER_SESSION';

export interface CustomDimension {
  name: string;
  parameterName: string;
  displayName: string;
  description: string;
  scope: DimensionScope;
  disallowAdsPersonalization?: boolean;
}

export interface CustomMetric {
  name: string;
  parameterName: string;
  displayName: string;
  description: string;
  scope: MetricScope;
  measurementUnit: string;
  restrictedMetricType?: string[];
}

export interface KeyEvent {
  name: string;
  eventName: string;
  createTime: string;
  deletable: boolean;
  custom: boolean;
  countingMethod: CountingMethod;
  defaultValue?: {
    numericValue: number;
    currencyCode: string;
  };
}

export interface Audience {
  name: string;
  displayName: string;
  description: string;
  membershipDurationDays: number;
  adsPersonalizationEnabled: boolean;
  eventTrigger?: {
    eventName: string;
    logCondition: string;
  };
  filterClauses: Array<{
    clauseType: string;
    simpleFilter?: {
      scope: string;
      filterExpression: unknown;
    };
  }>;
}

export interface Property {
  name: string;
  createTime: string;
  updateTime: string;
  parent: string;
  displayName: string;
  industryCategory: string;
  timeZone: string;
  currencyCode: string;
  serviceLevel: string;
  propertyType: string;
}

export interface AccountSummary {
  name: string;
  account: string;
  displayName: string;
  propertySummaries: Array<{
    property: string;
    displayName: string;
    propertyType: string;
  }>;
}

// ============================================
// Custom Dimensions
// ============================================

/**
 * List all custom dimensions
 */
export async function listCustomDimensions(): Promise<{
  customDimensions: CustomDimension[];
}> {
  const propertyPath = getPropertyPath();
  const url = `${ADMIN_API_BASE}/${propertyPath}/customDimensions`;

  return makeAuthenticatedRequest(url);
}

/**
 * Create a new custom dimension
 */
export async function createCustomDimension(data: {
  parameterName: string;
  displayName: string;
  description?: string;
  scope: DimensionScope;
}): Promise<CustomDimension> {
  const propertyPath = getPropertyPath();
  const url = `${ADMIN_API_BASE}/${propertyPath}/customDimensions`;

  return makeAuthenticatedRequest(url, {
    method: 'POST',
    body: {
      parameterName: data.parameterName,
      displayName: data.displayName,
      description: data.description || '',
      scope: data.scope,
    },
  });
}

/**
 * Archive (delete) a custom dimension
 */
export async function archiveCustomDimension(name: string): Promise<void> {
  const url = `${ADMIN_API_BASE}/${name}:archive`;

  await makeAuthenticatedRequest(url, { method: 'POST' });
}

// ============================================
// Custom Metrics
// ============================================

/**
 * List all custom metrics
 */
export async function listCustomMetrics(): Promise<{
  customMetrics: CustomMetric[];
}> {
  const propertyPath = getPropertyPath();
  const url = `${ADMIN_API_BASE}/${propertyPath}/customMetrics`;

  return makeAuthenticatedRequest(url);
}

/**
 * Create a new custom metric
 */
export async function createCustomMetric(data: {
  parameterName: string;
  displayName: string;
  description?: string;
  measurementUnit: string;
}): Promise<CustomMetric> {
  const propertyPath = getPropertyPath();
  const url = `${ADMIN_API_BASE}/${propertyPath}/customMetrics`;

  return makeAuthenticatedRequest(url, {
    method: 'POST',
    body: {
      parameterName: data.parameterName,
      displayName: data.displayName,
      description: data.description || '',
      scope: 'EVENT',
      measurementUnit: data.measurementUnit,
    },
  });
}

// ============================================
// Key Events (Conversions)
// ============================================

/**
 * List all key events (conversions)
 */
export async function listKeyEvents(): Promise<{
  keyEvents: KeyEvent[];
}> {
  const propertyPath = getPropertyPath();
  const url = `${ADMIN_API_BASE}/${propertyPath}/keyEvents`;

  return makeAuthenticatedRequest(url);
}

/**
 * Create a new key event (conversion)
 */
export async function createKeyEvent(data: {
  eventName: string;
  countingMethod?: CountingMethod;
  defaultValue?: {
    numericValue: number;
    currencyCode: string;
  };
}): Promise<KeyEvent> {
  const propertyPath = getPropertyPath();
  const url = `${ADMIN_API_BASE}/${propertyPath}/keyEvents`;

  return makeAuthenticatedRequest(url, {
    method: 'POST',
    body: {
      eventName: data.eventName,
      countingMethod: data.countingMethod || 'ONCE_PER_EVENT',
      defaultValue: data.defaultValue,
    },
  });
}

/**
 * Delete a key event
 */
export async function deleteKeyEvent(name: string): Promise<void> {
  const url = `${ADMIN_API_BASE}/${name}`;

  await makeAuthenticatedRequest(url, { method: 'DELETE' });
}

// ============================================
// Audiences
// ============================================

/**
 * List all audiences
 */
export async function listAudiences(): Promise<{
  audiences: Audience[];
}> {
  const propertyPath = getPropertyPath();
  const url = `${ADMIN_API_BASE}/${propertyPath}/audiences`;

  return makeAuthenticatedRequest(url);
}

/**
 * Create a simple audience based on event trigger
 */
export async function createAudience(data: {
  displayName: string;
  description?: string;
  membershipDurationDays?: number;
  eventTrigger?: {
    eventName: string;
    logCondition?: 'AUDIENCE_JOINED' | 'AUDIENCE_MEMBERSHIP_RENEWED';
  };
}): Promise<Audience> {
  const propertyPath = getPropertyPath();
  const url = `${ADMIN_API_BASE}/${propertyPath}/audiences`;

  return makeAuthenticatedRequest(url, {
    method: 'POST',
    body: {
      displayName: data.displayName,
      description: data.description || '',
      membershipDurationDays: data.membershipDurationDays || 30,
      adsPersonalizationEnabled: false,
      eventTrigger: data.eventTrigger
        ? {
            eventName: data.eventTrigger.eventName,
            logCondition: data.eventTrigger.logCondition || 'AUDIENCE_JOINED',
          }
        : undefined,
      filterClauses: [],
    },
  });
}

// ============================================
// Property Info
// ============================================

/**
 * Get property details
 */
export async function getProperty(): Promise<Property> {
  const propertyPath = getPropertyPath();
  const url = `${ADMIN_API_BASE}/${propertyPath}`;

  return makeAuthenticatedRequest(url);
}

/**
 * List all account summaries (shows all properties the service account has access to)
 */
export async function listAccountSummaries(): Promise<{
  accountSummaries: AccountSummary[];
}> {
  const url = `${ADMIN_API_BASE}/accountSummaries`;

  return makeAuthenticatedRequest(url);
}

// ============================================
// Data Retention Settings
// ============================================

export interface DataRetentionSettings {
  name: string;
  eventDataRetention: string;
  resetUserDataOnNewActivity: boolean;
}

/**
 * Get data retention settings
 */
export async function getDataRetentionSettings(): Promise<DataRetentionSettings> {
  const propertyPath = getPropertyPath();
  const url = `${ADMIN_API_BASE}/${propertyPath}/dataRetentionSettings`;

  return makeAuthenticatedRequest(url);
}

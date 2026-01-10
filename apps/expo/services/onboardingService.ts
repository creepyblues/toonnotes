/**
 * Onboarding Service
 *
 * Fetches and caches onboarding configuration from remote server.
 * Falls back to bundled defaults if network unavailable.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  OnboardingConfig,
  DEFAULT_ONBOARDING_CONFIG,
  mergeWithDefaults,
} from '@/constants/onboardingConfig';

// ============================================================================
// Constants
// ============================================================================

const STORAGE_KEY = 'toonnotes-onboarding-config';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

// Remote config endpoint (Supabase Edge Function or custom API)
// Set this to your production URL
const REMOTE_CONFIG_URL = process.env.EXPO_PUBLIC_API_URL
  ? `${process.env.EXPO_PUBLIC_API_URL}/onboarding-config`
  : null;

// ============================================================================
// Types
// ============================================================================

interface CachedConfig {
  config: OnboardingConfig;
  timestamp: number;
}

// ============================================================================
// Service Implementation
// ============================================================================

/**
 * Get cached config from AsyncStorage
 */
async function getCachedConfig(): Promise<CachedConfig | null> {
  try {
    const cached = await AsyncStorage.getItem(STORAGE_KEY);
    if (!cached) return null;
    return JSON.parse(cached) as CachedConfig;
  } catch (error) {
    console.warn('Failed to read cached onboarding config:', error);
    return null;
  }
}

/**
 * Save config to AsyncStorage cache
 */
async function setCachedConfig(config: OnboardingConfig): Promise<void> {
  try {
    const cached: CachedConfig = {
      config,
      timestamp: Date.now(),
    };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(cached));
  } catch (error) {
    console.warn('Failed to cache onboarding config:', error);
  }
}

/**
 * Check if cached config is still valid
 */
function isCacheValid(cached: CachedConfig): boolean {
  const age = Date.now() - cached.timestamp;
  return age < CACHE_TTL_MS;
}

/**
 * Fetch config from remote server
 */
async function fetchRemoteConfig(): Promise<Partial<OnboardingConfig> | null> {
  if (!REMOTE_CONFIG_URL) {
    // No remote URL configured - use defaults
    return null;
  }

  try {
    const response = await fetch(REMOTE_CONFIG_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.warn('Remote config fetch failed:', response.status);
      return null;
    }

    const data = await response.json();
    return data as Partial<OnboardingConfig>;
  } catch (error) {
    console.warn('Failed to fetch remote onboarding config:', error);
    return null;
  }
}

/**
 * Get onboarding configuration
 *
 * Strategy:
 * 1. Check cache - if valid, return immediately
 * 2. If cache stale or missing, try remote fetch
 * 3. Merge remote with defaults (remote takes precedence)
 * 4. Cache the result
 * 5. Fall back to defaults if all else fails
 */
export async function getOnboardingConfig(): Promise<OnboardingConfig> {
  // 1. Check cache
  const cached = await getCachedConfig();

  if (cached && isCacheValid(cached)) {
    // Cache hit - return immediately, but refresh in background
    refreshConfigInBackground();
    return cached.config;
  }

  // 2. Try remote fetch
  const remoteConfig = await fetchRemoteConfig();

  if (remoteConfig) {
    // 3. Merge with defaults
    const mergedConfig = mergeWithDefaults(remoteConfig);

    // 4. Cache the result
    await setCachedConfig(mergedConfig);

    return mergedConfig;
  }

  // 5. Fall back to cached (even if stale) or defaults
  if (cached) {
    return cached.config;
  }

  return DEFAULT_ONBOARDING_CONFIG;
}

/**
 * Refresh config in background without blocking
 */
async function refreshConfigInBackground(): Promise<void> {
  try {
    const remoteConfig = await fetchRemoteConfig();
    if (remoteConfig) {
      const mergedConfig = mergeWithDefaults(remoteConfig);
      await setCachedConfig(mergedConfig);
    }
  } catch (error) {
    // Silent fail for background refresh
    console.debug('Background config refresh failed:', error);
  }
}

/**
 * Force refresh config from remote
 */
export async function refreshOnboardingConfig(): Promise<OnboardingConfig> {
  const remoteConfig = await fetchRemoteConfig();

  if (remoteConfig) {
    const mergedConfig = mergeWithDefaults(remoteConfig);
    await setCachedConfig(mergedConfig);
    return mergedConfig;
  }

  return DEFAULT_ONBOARDING_CONFIG;
}

/**
 * Clear cached config (for testing/debugging)
 */
export async function clearOnboardingConfigCache(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to clear onboarding config cache:', error);
  }
}

/**
 * Get config version for comparison
 */
export async function getConfigVersion(): Promise<number> {
  const config = await getOnboardingConfig();
  return config.version;
}

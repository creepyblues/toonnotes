import { devLog, devWarn } from '@/utils/devLog';
/**
 * Secure Storage Service
 *
 * Stores sensitive data like API keys using expo-secure-store.
 * - iOS: Uses Keychain Services (encrypted)
 * - Android: Uses EncryptedSharedPreferences (AES-256)
 * - Web: Falls back to localStorage (not encrypted, for development only)
 *
 * Note: expo-secure-store requires a development build (not Expo Go).
 */

import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const GEMINI_API_KEY = 'gemini_api_key';

/**
 * Check if secure storage is available
 * (expo-secure-store requires native build on iOS/Android)
 */
async function isSecureStoreAvailable(): Promise<boolean> {
  if (Platform.OS === 'web') {
    return false;
  }
  try {
    // Test if SecureStore is accessible
    return await SecureStore.isAvailableAsync();
  } catch {
    return false;
  }
}

/**
 * Save the Gemini API key
 */
export async function saveApiKey(apiKey: string): Promise<boolean> {
  try {
    const trimmedKey = apiKey.trim();
    if (!trimmedKey) {
      // If empty, delete the key
      await deleteApiKey();
      return true;
    }

    // Validate API key format (basic check)
    if (!isValidApiKeyFormat(trimmedKey)) {
      devWarn('Invalid API key format');
      return false;
    }

    // Web fallback (not encrypted - for development only)
    if (Platform.OS === 'web') {
      localStorage.setItem(GEMINI_API_KEY, trimmedKey);
      return true;
    }

    // Use SecureStore for native platforms (encrypted storage)
    const available = await isSecureStoreAvailable();
    if (available) {
      await SecureStore.setItemAsync(GEMINI_API_KEY, trimmedKey, {
        // Require device authentication (Face ID / Touch ID / PIN) for access
        // Uncomment for extra security, but adds friction for users:
        // requireAuthentication: true,
        keychainAccessible: SecureStore.WHEN_UNLOCKED,
      });
      return true;
    }

    // Fallback: SecureStore not available (shouldn't happen in dev build)
    devWarn('SecureStore not available, API key not saved');
    return false;
  } catch (error) {
    console.error('Failed to save API key:', error);
    return false;
  }
}

/**
 * Retrieve the Gemini API key
 */
export async function getApiKey(): Promise<string | null> {
  try {
    // Web fallback
    if (Platform.OS === 'web') {
      return localStorage.getItem(GEMINI_API_KEY);
    }

    // Use SecureStore for native platforms
    const available = await isSecureStoreAvailable();
    if (available) {
      return await SecureStore.getItemAsync(GEMINI_API_KEY);
    }

    return null;
  } catch (error) {
    console.error('Failed to retrieve API key:', error);
    return null;
  }
}

/**
 * Delete the Gemini API key
 */
export async function deleteApiKey(): Promise<boolean> {
  try {
    // Web fallback
    if (Platform.OS === 'web') {
      localStorage.removeItem(GEMINI_API_KEY);
      return true;
    }

    // Use SecureStore for native platforms
    const available = await isSecureStoreAvailable();
    if (available) {
      await SecureStore.deleteItemAsync(GEMINI_API_KEY);
      return true;
    }

    return false;
  } catch (error) {
    console.error('Failed to delete API key:', error);
    return false;
  }
}

/**
 * Check if an API key exists
 */
export async function hasApiKey(): Promise<boolean> {
  const key = await getApiKey();
  return key !== null && key.length > 0;
}

/**
 * Validate API key format
 * Gemini API keys typically start with 'AIza'
 */
function isValidApiKeyFormat(key: string): boolean {
  // Basic validation - key should be reasonable length
  // Gemini API keys are typically 39 characters starting with 'AIza'
  if (key.length < 20 || key.length > 100) {
    return false;
  }

  // Only allow alphanumeric characters, underscores, and hyphens
  const validPattern = /^[A-Za-z0-9_-]+$/;
  return validPattern.test(key);
}

/**
 * Mask an API key for display purposes
 * Shows first 4 and last 4 characters
 */
export function maskApiKey(key: string): string {
  if (!key || key.length < 12) return '****';
  return `${key.slice(0, 4)}${'*'.repeat(8)}${key.slice(-4)}`;
}

/**
 * Secure Storage Service
 *
 * Stores sensitive data like API keys using AsyncStorage.
 * Note: For production apps requiring maximum security, use expo-secure-store
 * with a development build (not compatible with Expo Go).
 */

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const GEMINI_API_KEY = 'gemini_api_key';

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
      console.warn('Invalid API key format');
      return false;
    }

    if (Platform.OS === 'web') {
      localStorage.setItem(GEMINI_API_KEY, trimmedKey);
      return true;
    }

    await AsyncStorage.setItem(GEMINI_API_KEY, trimmedKey);
    return true;
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
    if (Platform.OS === 'web') {
      return localStorage.getItem(GEMINI_API_KEY);
    }

    return await AsyncStorage.getItem(GEMINI_API_KEY);
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
    if (Platform.OS === 'web') {
      localStorage.removeItem(GEMINI_API_KEY);
      return true;
    }

    await AsyncStorage.removeItem(GEMINI_API_KEY);
    return true;
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

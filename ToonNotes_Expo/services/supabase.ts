/**
 * Supabase Client Configuration
 *
 * Sets up the Supabase client with:
 * - Secure token storage (expo-secure-store on native, AsyncStorage on web)
 * - Auto token refresh
 * - Session persistence
 */

import 'react-native-url-polyfill/auto';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Environment variables (must be prefixed with EXPO_PUBLIC_ to be available in client)
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase environment variables not configured. ' +
    'Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to your .env.local file.'
  );
}

/**
 * Check if we're running in a browser environment (not SSR)
 */
const isBrowser = typeof window !== 'undefined';

/**
 * Custom storage adapter for Supabase auth
 * - Native (iOS/Android): Uses expo-secure-store (Keychain/EncryptedSharedPrefs)
 * - Web (browser): Uses AsyncStorage (localStorage wrapper)
 * - SSR: Returns null/no-op (session will be loaded client-side)
 */
const ExpoSecureStoreAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    // During SSR, return null - session will be loaded on client
    if (Platform.OS === 'web' && !isBrowser) {
      return null;
    }
    if (Platform.OS === 'web') {
      return AsyncStorage.getItem(key);
    }
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.error('SecureStore getItem error:', error);
      return null;
    }
  },

  setItem: async (key: string, value: string): Promise<void> => {
    // During SSR, skip storage operations
    if (Platform.OS === 'web' && !isBrowser) {
      return;
    }
    if (Platform.OS === 'web') {
      await AsyncStorage.setItem(key, value);
      return;
    }
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.error('SecureStore setItem error:', error);
    }
  },

  removeItem: async (key: string): Promise<void> => {
    // During SSR, skip storage operations
    if (Platform.OS === 'web' && !isBrowser) {
      return;
    }
    if (Platform.OS === 'web') {
      await AsyncStorage.removeItem(key);
      return;
    }
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error('SecureStore removeItem error:', error);
    }
  },
};

/**
 * Supabase client instance
 *
 * Configured with:
 * - Custom storage adapter for secure token storage
 * - Auto token refresh enabled
 * - Session persistence enabled
 * - detectSessionInUrl disabled (we handle OAuth callbacks manually)
 */
export const supabase: SupabaseClient = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      storage: ExpoSecureStoreAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false, // We handle OAuth callbacks manually in app/auth/callback.tsx
    },
  }
);

/**
 * Check if Supabase is properly configured
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

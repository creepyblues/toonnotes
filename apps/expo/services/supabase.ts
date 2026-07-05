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
 * Report a storage failure to Crashlytics (lazy require to avoid an import
 * cycle: firebaseAnalytics may transitively reference this module).
 */
function reportStorageError(error: unknown, op: string): void {
  try {
    const { recordError } = require('./firebaseAnalytics');
    recordError(error instanceof Error ? error : new Error(String(error)), {
      source: 'supabase-secure-store',
      op,
    });
  } catch {
    // Crashlytics unavailable (e.g. tests) — swallow.
  }
}

// expo-secure-store warns above ~2048 bytes and can fail to persist larger
// values on some Android devices. Supabase sessions (access + refresh + user +
// provider tokens) routinely exceed that, causing "logged out on relaunch".
// Store large values in fixed-size chunks under `${key}.<i>` with a small
// sentinel at `${key}` recording the chunk count.
const SECURE_STORE_CHUNK_SIZE = 1800;
const CHUNK_SENTINEL = '__chunked__:';

async function clearSecureStoreChunks(key: string): Promise<void> {
  // Best-effort removal of any previously written chunks.
  for (let i = 0; ; i++) {
    const chunk = await SecureStore.getItemAsync(`${key}.${i}`);
    if (chunk === null) break;
    await SecureStore.deleteItemAsync(`${key}.${i}`);
  }
}

/**
 * Custom storage adapter for Supabase auth
 * - Native (iOS/Android): expo-secure-store (Keychain/EncryptedSharedPrefs),
 *   with automatic chunking for values above the SecureStore size limit
 * - Web (browser): AsyncStorage (localStorage wrapper)
 * - SSR: no-op (session loaded client-side)
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
      const raw = await SecureStore.getItemAsync(key);
      if (raw === null) return null;
      if (!raw.startsWith(CHUNK_SENTINEL)) {
        return raw; // Small value (or legacy single-value session).
      }
      const count = parseInt(raw.slice(CHUNK_SENTINEL.length), 10);
      if (!Number.isFinite(count) || count <= 0) return null;
      let value = '';
      for (let i = 0; i < count; i++) {
        const chunk = await SecureStore.getItemAsync(`${key}.${i}`);
        if (chunk === null) {
          // Corrupted/partial write — treat as no session.
          return null;
        }
        value += chunk;
      }
      return value;
    } catch (error) {
      console.error('SecureStore getItem error:', error);
      reportStorageError(error, 'getItem');
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
      // Clear any stale chunks from a previous larger value.
      await clearSecureStoreChunks(key);

      if (value.length <= SECURE_STORE_CHUNK_SIZE) {
        await SecureStore.setItemAsync(key, value);
        return;
      }

      const count = Math.ceil(value.length / SECURE_STORE_CHUNK_SIZE);
      for (let i = 0; i < count; i++) {
        const start = i * SECURE_STORE_CHUNK_SIZE;
        await SecureStore.setItemAsync(
          `${key}.${i}`,
          value.slice(start, start + SECURE_STORE_CHUNK_SIZE)
        );
      }
      await SecureStore.setItemAsync(key, `${CHUNK_SENTINEL}${count}`);
    } catch (error) {
      console.error('SecureStore setItem error:', error);
      reportStorageError(error, 'setItem');
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
      await clearSecureStoreChunks(key);
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error('SecureStore removeItem error:', error);
      reportStorageError(error, 'removeItem');
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

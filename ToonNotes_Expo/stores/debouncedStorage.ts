/**
 * Debounced AsyncStorage Wrapper
 *
 * Batches writes to AsyncStorage to reduce disk I/O and improve performance.
 * Writes are debounced with a configurable delay.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { StateStorage } from 'zustand/middleware';

// Check if we're running in a browser environment (not SSR)
const isBrowser = typeof window !== 'undefined';

// Pending writes queue
const pendingWrites: Map<string, { value: string; timer: ReturnType<typeof setTimeout> }> = new Map();

// Default debounce delay in milliseconds
const DEFAULT_DEBOUNCE_MS = 500;

/**
 * Create a debounced storage adapter for Zustand persist middleware
 */
export function createDebouncedStorage(debounceMs: number = DEFAULT_DEBOUNCE_MS): StateStorage {
  return {
    getItem: async (name: string): Promise<string | null> => {
      // During SSR, return null - state will be hydrated on client
      if (Platform.OS === 'web' && !isBrowser) {
        return null;
      }

      // Check if there's a pending write for this key
      const pending = pendingWrites.get(name);
      if (pending) {
        return pending.value;
      }

      try {
        return await AsyncStorage.getItem(name);
      } catch (error) {
        console.error(`Failed to read from AsyncStorage: ${name}`, error);
        return null;
      }
    },

    setItem: async (name: string, value: string): Promise<void> => {
      // During SSR, skip storage operations
      if (Platform.OS === 'web' && !isBrowser) {
        return;
      }

      // Cancel any pending write for this key
      const pending = pendingWrites.get(name);
      if (pending) {
        clearTimeout(pending.timer);
      }

      // Schedule a new debounced write
      const timer = setTimeout(async () => {
        try {
          await AsyncStorage.setItem(name, value);
          pendingWrites.delete(name);
        } catch (error) {
          console.error(`Failed to write to AsyncStorage: ${name}`, error);
        }
      }, debounceMs);

      pendingWrites.set(name, { value, timer });
    },

    removeItem: async (name: string): Promise<void> => {
      // During SSR, skip storage operations
      if (Platform.OS === 'web' && !isBrowser) {
        return;
      }

      // Cancel any pending write for this key
      const pending = pendingWrites.get(name);
      if (pending) {
        clearTimeout(pending.timer);
        pendingWrites.delete(name);
      }

      try {
        await AsyncStorage.removeItem(name);
      } catch (error) {
        console.error(`Failed to remove from AsyncStorage: ${name}`, error);
      }
    },
  };
}

/**
 * Force flush all pending writes immediately
 * Useful before app exit or when you need immediate persistence
 */
export async function flushPendingWrites(): Promise<void> {
  const writes: Promise<void>[] = [];

  for (const [name, { value, timer }] of pendingWrites) {
    clearTimeout(timer);
    writes.push(
      AsyncStorage.setItem(name, value)
        .then(() => {
          pendingWrites.delete(name);
        })
        .catch((error) => {
          console.error(`Failed to flush write to AsyncStorage: ${name}`, error);
        })
    );
  }

  await Promise.all(writes);
}

/**
 * Get the count of pending writes (for debugging)
 */
export function getPendingWriteCount(): number {
  return pendingWrites.size;
}

// Default debounced storage instance
export const debouncedStorage = createDebouncedStorage();

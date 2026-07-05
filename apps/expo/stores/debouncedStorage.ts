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

// Track consecutive persistence write failures. A single failure can be
// transient, but a run of them means state is silently not being persisted
// (e.g. Android's ~6MB AsyncStorage limit hit) — surface that to Crashlytics.
let consecutiveWriteFailures = 0;

/**
 * Report a persistence failure to Crashlytics (lazy require avoids pulling
 * analytics into this low-level module's import graph / test runs).
 */
function reportPersistError(error: unknown, name: string, op: string): void {
  consecutiveWriteFailures += 1;
  try {
    const { recordError } = require('@/services/firebaseAnalytics');
    recordError(error instanceof Error ? error : new Error(String(error)), {
      source: 'debounced-storage',
      op,
      key: name,
      consecutiveFailures: String(consecutiveWriteFailures),
    });
  } catch {
    // Analytics unavailable (e.g. tests) — swallow.
  }
}

function notePersistSuccess(): void {
  consecutiveWriteFailures = 0;
}

/**
 * Number of consecutive persistence write failures observed. Non-zero means
 * recent state changes may not have been saved to disk.
 */
export function getConsecutiveWriteFailures(): number {
  return consecutiveWriteFailures;
}

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
          notePersistSuccess();
        } catch (error) {
          console.error(`Failed to write to AsyncStorage: ${name}`, error);
          reportPersistError(error, name, 'setItem');
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
          notePersistSuccess();
        })
        .catch((error) => {
          console.error(`Failed to flush write to AsyncStorage: ${name}`, error);
          reportPersistError(error, name, 'flush');
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

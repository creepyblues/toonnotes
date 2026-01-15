import * as Crypto from 'expo-crypto';

/**
 * Cryptographically secure UUID v4 generator
 * Uses expo-crypto which leverages native platform crypto APIs
 */
export function generateUUID(): string {
  return Crypto.randomUUID();
}

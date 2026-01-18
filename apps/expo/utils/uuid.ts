import { Platform } from 'react-native';

/**
 * Cryptographically secure UUID v4 generator
 *
 * Uses platform-appropriate crypto APIs:
 * - iOS/Android: expo-crypto (native crypto APIs)
 * - Web: Web Crypto API (crypto.randomUUID)
 * - SSR/Node: crypto module
 */
export function generateUUID(): string {
  // Web platform - use Web Crypto API
  if (Platform.OS === 'web') {
    // Check if we're in browser environment
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    // Fallback for SSR - use Node crypto
    if (typeof require !== 'undefined') {
      try {
        // Dynamic require to avoid bundling issues
        const nodeCrypto = require('crypto');
        return nodeCrypto.randomUUID();
      } catch {
        // Final fallback - use timestamp + random
        return generateFallbackUUID();
      }
    }
    return generateFallbackUUID();
  }

  // Native platforms (iOS/Android) - use expo-crypto
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const ExpoCrypto = require('expo-crypto');
  return ExpoCrypto.randomUUID();
}

/**
 * Fallback UUID generator when crypto APIs are unavailable
 * Uses Math.random() - NOT cryptographically secure but functional
 */
function generateFallbackUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

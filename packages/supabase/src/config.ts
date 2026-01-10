/**
 * Supabase Configuration Constants
 *
 * These constants define the environment variable names used
 * across different platforms (Expo, Next.js).
 */

// Environment variable names
export const SUPABASE_URL_ENV = 'SUPABASE_URL';
export const SUPABASE_ANON_KEY_ENV = 'SUPABASE_ANON_KEY';

// Expo-specific environment variable names (require EXPO_PUBLIC_ prefix)
export const EXPO_SUPABASE_URL_ENV = 'EXPO_PUBLIC_SUPABASE_URL';
export const EXPO_SUPABASE_ANON_KEY_ENV = 'EXPO_PUBLIC_SUPABASE_ANON_KEY';

// Next.js-specific environment variable names (can use NEXT_PUBLIC_ prefix)
export const NEXT_SUPABASE_URL_ENV = 'NEXT_PUBLIC_SUPABASE_URL';
export const NEXT_SUPABASE_ANON_KEY_ENV = 'NEXT_PUBLIC_SUPABASE_ANON_KEY';

/**
 * Auth redirect URLs for OAuth
 * These should be configured in Supabase dashboard
 */
export const AUTH_CALLBACK_PATHS = {
  expo: '/auth/callback',
  web: '/auth/callback',
  webapp: '/auth/callback',
} as const;

/**
 * Storage bucket names
 */
export const STORAGE_BUCKETS = {
  images: 'images',
  avatars: 'avatars',
  stickers: 'stickers',
} as const;

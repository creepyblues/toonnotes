import { useColorScheme as useSystemColorScheme } from 'react-native';
import { useUserStore } from '@/stores';

/**
 * Custom hook that returns the color scheme based on user preference.
 * Falls back to system preference if user hasn't set a preference.
 */
export function useColorScheme(): 'light' | 'dark' {
  const systemScheme = useSystemColorScheme();
  const { settings } = useUserStore();

  // User preference takes precedence
  return settings.darkMode ? 'dark' : 'light';
}

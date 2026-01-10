'use client';

import { useEffect } from 'react';
import { useUIStore } from '@/stores';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const darkMode = useUIStore((state) => state.darkMode);

  useEffect(() => {
    // Apply dark mode class to document
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Prevent flash of wrong theme on initial load
  useEffect(() => {
    // Check if user has dark mode preference in localStorage
    const stored = localStorage.getItem('toonnotes-ui');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.state?.darkMode) {
          document.documentElement.classList.add('dark');
        }
      } catch {
        // Ignore parse errors
      }
    }
  }, []);

  return <>{children}</>;
}

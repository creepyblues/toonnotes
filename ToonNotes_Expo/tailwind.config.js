/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // iOS HIG System Colors (Light Mode)
        system: {
          bgPrimary: '#FFFFFF',
          bgSecondary: '#F2F2F7',
          bgTertiary: '#FFFFFF',
          textPrimary: '#000000',
          textSecondary: '#8E8E93',
          textTertiary: '#C7C7CC',
          separator: 'rgba(60, 60, 67, 0.12)',
          border: '#E5E5EA',
        },
        // iOS HIG System Colors (Dark Mode)
        systemDark: {
          bgPrimary: '#000000',
          bgSecondary: '#1C1C1E',
          bgTertiary: '#2C2C2E',
          textPrimary: '#FFFFFF',
          textSecondary: '#8E8E93',
          textTertiary: '#48484A',
          separator: 'rgba(84, 84, 88, 0.65)',
          border: '#38383A',
        },
        // Brand accent (iOS HIG compatible)
        accent: {
          DEFAULT: '#7C3AED',
          light: '#A78BFA',
          dark: '#5B21B6',
        },
        // Semantic colors
        semantic: {
          success: '#34C759',
          warning: '#FF9500',
          error: '#FF3B30',
          info: '#007AFF',
        },
        // Tag colors
        tag: {
          purple: '#7C3AED',
          blue: '#3B82F6',
          green: '#10B981',
          orange: '#F97316',
          pink: '#EC4899',
          teal: '#14B8A6',
        },
        // Brand colors - Superlist-inspired purple (legacy)
        primary: {
          50: '#F5F3FF',
          100: '#EDE9FE',
          200: '#DDD6FE',
          300: '#C4B5FD',
          400: '#A78BFA',
          500: '#8B5CF6',
          600: '#7C3AED',
          700: '#6D28D9',
          800: '#5B21B6',
          900: '#4C1D95',
        },
        // Note colors (refreshed to harmonize with purple)
        note: {
          white: '#FFFFFF',
          lavender: '#EDE9FE',
          rose: '#FFE4E6',
          peach: '#FED7AA',
          mint: '#D1FAE5',
          sky: '#E0F2FE',
          violet: '#DDD6FE',
        },
        // Surface colors (legacy - use system colors instead)
        surface: {
          light: '#FAFAFF',
          lightCard: '#FFFFFF',
          lightElevated: '#F5F3FF',
          dark: '#0F0D15',
          darkCard: '#1C1826',
          darkElevated: '#252136',
        },
        // Text colors (legacy - use system colors instead)
        text: {
          primary: '#1A1625',
          secondary: '#6B6B7B',
          tertiary: '#9CA3AF',
          primaryDark: '#F5F3FF',
          secondaryDark: '#A8A8B8',
          tertiaryDark: '#6B6B7B',
        },
        // Legacy ink colors (for compatibility)
        ink: {
          dark: '#1A1625',
          medium: '#6B6B7B',
          light: '#9CA3AF',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
        hand: ['Caveat', 'cursive'],
        serif: ['Playfair Display', 'serif'],
      },
      boxShadow: {
        'sm': '0 1px 2px rgba(139, 92, 246, 0.05)',
        'md': '0 4px 6px rgba(139, 92, 246, 0.07)',
        'lg': '0 10px 15px rgba(139, 92, 246, 0.1)',
        'xl': '0 20px 25px rgba(139, 92, 246, 0.15)',
      },
      borderRadius: {
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '20px',
        '2xl': '24px',
      },
    },
  },
  plugins: [],
};

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
        // ==========================================================
        // BRAND SCALES
        // ==========================================================

        // Primary: Hanok Teal
        teal: {
          50: '#E6F4F4',
          100: '#C2E4E3',
          200: '#99D1D0',
          300: '#70BFBD',
          400: '#5CACAB',
          500: '#4C9C9B',  // MAIN
          600: '#428888',
          700: '#367272',
          800: '#2A5B5A',
          900: '#1E4544',
        },

        // Highlight: Sunrise Coral
        coral: {
          50: '#FFF0F0',
          100: '#FFD6D6',
          200: '#FFB3B3',
          300: '#FF9090',
          400: '#FF7D7D',
          500: '#FF6B6B',  // MAIN
          600: '#E55A5A',
          700: '#CC4A4A',
          800: '#B33A3A',
          900: '#992A2A',
        },

        // Neutral: Warm Gray
        neutral: {
          50: '#FAFAF9',
          100: '#F5F5F4',
          200: '#E7E5E4',
          300: '#D6D3D1',
          400: '#A8A29E',
          500: '#78716C',
          600: '#57534E',
          700: '#44403C',
          800: '#292524',
          900: '#1C1917',
        },

        // ==========================================================
        // SYSTEM COLORS (Light Mode)
        // ==========================================================
        system: {
          bgPrimary: '#FFFFFF',
          bgSecondary: '#FAFAF9',     // neutral-50
          bgTertiary: '#F5F5F4',      // neutral-100
          textPrimary: '#1C1917',     // neutral-900
          textSecondary: '#78716C',   // neutral-500
          textTertiary: '#A8A29E',    // neutral-400
          separator: 'rgba(28, 25, 23, 0.08)',
          border: '#E7E5E4',          // neutral-200
        },

        // System Colors (Dark Mode)
        systemDark: {
          bgPrimary: '#1C1917',       // neutral-900
          bgSecondary: '#292524',     // neutral-800
          bgTertiary: '#44403C',      // neutral-700
          textPrimary: '#FAFAF9',     // neutral-50
          textSecondary: '#A8A29E',   // neutral-400
          textTertiary: '#78716C',    // neutral-500
          separator: 'rgba(250, 250, 249, 0.1)',
          border: '#57534E',          // neutral-600
        },

        // ==========================================================
        // ACCENT COLORS
        // ==========================================================

        // Primary accent (Teal)
        accent: {
          DEFAULT: '#4C9C9B',  // teal-500
          light: '#70BFBD',    // teal-300
          dark: '#367272',     // teal-700
        },

        // Highlight/CTA (Coral)
        highlight: {
          DEFAULT: '#FF6B6B',  // coral-500
          light: '#FF9090',    // coral-300
          dark: '#E55A5A',     // coral-600
        },

        // ==========================================================
        // SEMANTIC COLORS
        // ==========================================================
        semantic: {
          success: '#22C55E',
          warning: '#F59E0B',
          error: '#FF6B6B',    // coral-500
          info: '#4C9C9B',     // teal-500
        },

        // ==========================================================
        // TAG COLORS
        // ==========================================================
        tag: {
          teal: '#4C9C9B',
          coral: '#FF6B6B',
          amber: '#F59E0B',
          green: '#22C55E',
          blue: '#3B82F6',
          purple: '#8B5CF6',
        },

        // ==========================================================
        // NOTE BACKGROUND COLORS
        // ==========================================================
        note: {
          white: '#FFFFFF',
          cream: '#FAFAF9',     // neutral-50
          mint: '#E6F4F4',      // teal-50
          peach: '#FFF0F0',     // coral-50
          lavender: '#EDE9FE',  // purple tint
          sky: '#E0F2FE',       // blue tint
        },

        // ==========================================================
        // LEGACY COMPATIBILITY
        // ==========================================================
        // Keep 'primary' as teal scale for backwards compatibility
        primary: {
          50: '#E6F4F4',
          100: '#C2E4E3',
          200: '#99D1D0',
          300: '#70BFBD',
          400: '#5CACAB',
          500: '#4C9C9B',
          600: '#428888',
          700: '#367272',
          800: '#2A5B5A',
          900: '#1E4544',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
        hand: ['Caveat', 'cursive'],
        serif: ['Playfair Display', 'serif'],
      },
      // Shadows with teal tint
      boxShadow: {
        'sm': '0 1px 2px rgba(76, 156, 155, 0.05)',
        'md': '0 4px 6px rgba(76, 156, 155, 0.07)',
        'lg': '0 10px 15px rgba(76, 156, 155, 0.1)',
        'xl': '0 20px 25px rgba(76, 156, 155, 0.15)',
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

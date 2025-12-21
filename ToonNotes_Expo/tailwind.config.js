/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Brand colors
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        // Note colors (Keep-style)
        note: {
          white: '#FFFFFF',
          red: '#F28B82',
          orange: '#FBBC04',
          yellow: '#FFF475',
          green: '#CCFF90',
          teal: '#A7FFEB',
          blue: '#CBF0F8',
          purple: '#D7AEFB',
        },
        // Ink colors for text
        ink: {
          dark: '#1F2937',
          medium: '#4B5563',
          light: '#9CA3AF',
        },
        // Dark mode surface colors
        surface: {
          dark: '#121212',
          darkElevated: '#1E1E1E',
          darkCard: '#2D2D2D',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        hand: ['Caveat', 'cursive'],
        serif: ['Playfair Display', 'serif'],
      },
    },
  },
  plugins: [],
};

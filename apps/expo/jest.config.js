// Custom Jest config to avoid ESM issues in react-native 0.81+
// We don't use jest-expo preset to avoid the problematic react-native/jest/setup.js

module.exports = {
  // Don't use preset - configure manually to avoid ESM issues
  // preset: 'jest-expo',

  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  // Transform TypeScript and JavaScript files
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },

  // Transform these node_modules packages (they use non-standard JS)
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|@react-native/.*)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|zustand)',
  ],

  testMatch: ['**/__tests__/**/*.test.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],

  collectCoverageFrom: [
    'stores/**/*.{ts,tsx}',
    'services/**/*.{ts,tsx}',
    'utils/**/*.{ts,tsx}',
    '!**/__tests__/**',
    '!**/node_modules/**',
  ],

  moduleNameMapper: {
    // Mock binary/asset files first (before @/ alias to ensure assets are mocked)
    '^@/assets/(.*)\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/__mocks__/fileMock.js',
    '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/__mocks__/fileMock.js',
    // Path alias for imports
    '^@/(.*)$': '<rootDir>/$1',
  },

  // Handle pnpm symlinked node_modules
  moduleDirectories: ['node_modules', '../../node_modules'],

  // File extensions to consider
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

  // Use Node test environment
  testEnvironment: 'node',

  // Clear mocks between tests
  clearMocks: true,
};

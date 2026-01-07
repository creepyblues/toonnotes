// Mock Firebase Analytics
jest.mock('@react-native-firebase/analytics', () => () => ({
  logEvent: jest.fn(),
  logScreenView: jest.fn(),
  setAnalyticsCollectionEnabled: jest.fn(),
  setUserId: jest.fn(),
  setUserProperties: jest.fn(),
}));

// Mock Firebase Crashlytics
jest.mock('@react-native-firebase/crashlytics', () => () => ({
  recordError: jest.fn(),
  log: jest.fn(),
  setUserId: jest.fn(),
  setAttribute: jest.fn(),
  setCrashlyticsCollectionEnabled: jest.fn(),
}));

// Mock Firebase App
jest.mock('@react-native-firebase/app', () => ({
  __esModule: true,
  default: {
    apps: [],
    app: jest.fn(),
  },
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
  getAllKeys: jest.fn(() => Promise.resolve([])),
  multiGet: jest.fn(() => Promise.resolve([])),
  multiSet: jest.fn(() => Promise.resolve()),
  multiRemove: jest.fn(() => Promise.resolve()),
}));

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useLocalSearchParams: () => ({}),
  router: {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  },
}));

// Mock expo-image-picker
jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(() =>
    Promise.resolve({ status: 'granted' })
  ),
  launchImageLibraryAsync: jest.fn(() =>
    Promise.resolve({
      canceled: false,
      assets: [{ uri: 'mock://image.jpg' }],
    })
  ),
}));

// Mock Supabase to prevent auto-refresh timer issues
jest.mock('@/services/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      upsert: jest.fn().mockResolvedValue({ data: null, error: null }),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({ data: [], error: null }),
      order: jest.fn().mockResolvedValue({ data: [], error: null }),
    })),
    auth: {
      getSession: jest.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
      signInWithOAuth: jest.fn(),
      signOut: jest.fn().mockResolvedValue({ error: null }),
    },
    channel: jest.fn(() => ({
      on: jest.fn().mockReturnThis(),
      subscribe: jest.fn().mockReturnThis(),
    })),
    removeChannel: jest.fn().mockResolvedValue(undefined),
  },
}));

// Suppress console errors during tests
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
};

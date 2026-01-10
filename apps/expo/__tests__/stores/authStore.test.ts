/**
 * Auth Store Unit Tests
 */

import { renderHook, act, waitFor } from '@testing-library/react-native';

// Mock Supabase before importing the store
const mockGetSession = jest.fn();
const mockSignOut = jest.fn();
const mockOnAuthStateChange = jest.fn();
const mockSignInWithOAuth = jest.fn();

jest.mock('@/services/supabase', () => ({
  supabase: {
    auth: {
      getSession: () => mockGetSession(),
      signOut: () => mockSignOut(),
      onAuthStateChange: (callback: any) => {
        mockOnAuthStateChange(callback);
        return { data: { subscription: { unsubscribe: jest.fn() } } };
      },
    },
  },
  isSupabaseConfigured: jest.fn(() => true),
}));

jest.mock('@/services/authService', () => ({
  signInWithOAuth: (provider: string) => mockSignInWithOAuth(provider),
  signOut: () => mockSignOut(),
}));

// Import after mocks
import { useAuthStore } from '@/stores/authStore';

describe('AuthStore', () => {
  beforeEach(() => {
    // Reset store state
    useAuthStore.setState({
      session: null,
      user: null,
      isLoading: false,
      isInitialized: false,
      error: null,
    });

    // Clear mocks
    jest.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = useAuthStore.getState();

      expect(state.session).toBeNull();
      expect(state.user).toBeNull();
      expect(state.isLoading).toBe(false);
      expect(state.isInitialized).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('initialize', () => {
    it('should set isInitialized to true after initialization', async () => {
      mockGetSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.initialize();
      });

      expect(result.current.isInitialized).toBe(true);
      expect(result.current.isLoading).toBe(false);
    });

    it('should set session and user when session exists', async () => {
      const mockSession = {
        user: { id: 'user-123', email: 'test@example.com' },
        access_token: 'token-123',
      };

      mockGetSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.initialize();
      });

      expect(result.current.session).toEqual(mockSession);
      expect(result.current.user).toEqual(mockSession.user);
    });

    it('should set error when getSession fails', async () => {
      mockGetSession.mockResolvedValue({
        data: { session: null },
        error: { message: 'Network error' },
      });

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.initialize();
      });

      expect(result.current.error).toBe('Network error');
      expect(result.current.isInitialized).toBe(true);
    });

    it('should setup auth state change listener', async () => {
      mockGetSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.initialize();
      });

      expect(mockOnAuthStateChange).toHaveBeenCalled();
    });
  });

  describe('signInWithGoogle', () => {
    it('should set isLoading during sign in', async () => {
      mockSignInWithOAuth.mockResolvedValue(undefined);

      const { result } = renderHook(() => useAuthStore());

      // Don't await to check loading state
      act(() => {
        result.current.signInWithGoogle();
      });

      // Should be loading immediately after call
      expect(result.current.isLoading).toBe(true);
    });

    it('should call signInWithOAuth with google provider', async () => {
      mockSignInWithOAuth.mockResolvedValue(undefined);

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.signInWithGoogle();
      });

      expect(mockSignInWithOAuth).toHaveBeenCalledWith('google');
    });

    it('should handle sign in error', async () => {
      mockSignInWithOAuth.mockRejectedValue(new Error('OAuth failed'));

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.signInWithGoogle();
      });

      expect(result.current.error).toBe('OAuth failed');
      expect(result.current.isLoading).toBe(false);
    });

    it('should handle user cancellation gracefully', async () => {
      mockSignInWithOAuth.mockRejectedValue(new Error('Authentication was cancelled'));

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.signInWithGoogle();
      });

      // Should not set error for cancellation
      expect(result.current.error).toBeNull();
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('signInWithApple', () => {
    it('should call signInWithOAuth with apple provider', async () => {
      mockSignInWithOAuth.mockResolvedValue(undefined);

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.signInWithApple();
      });

      expect(mockSignInWithOAuth).toHaveBeenCalledWith('apple');
    });
  });

  describe('signOut', () => {
    it('should clear session and user on sign out', async () => {
      // Setup initial authenticated state
      useAuthStore.setState({
        session: { user: { id: '123' } } as any,
        user: { id: '123' } as any,
        isInitialized: true,
      });

      mockSignOut.mockResolvedValue({ error: null });

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.signOut();
      });

      expect(result.current.session).toBeNull();
      expect(result.current.user).toBeNull();
    });

    it('should set error when sign out fails', async () => {
      mockSignOut.mockRejectedValue(new Error('Sign out failed'));

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.signOut();
      });

      expect(result.current.error).toBe('Sign out failed');
    });
  });

  describe('clearError', () => {
    it('should clear error state', () => {
      useAuthStore.setState({ error: 'Some error' });

      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('setSession', () => {
    it('should set session and user', () => {
      const mockSession = {
        user: { id: 'user-456', email: 'new@example.com' },
        access_token: 'new-token',
      };

      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.setSession(mockSession as any);
      });

      expect(result.current.session).toEqual(mockSession);
      expect(result.current.user).toEqual(mockSession.user);
    });

    it('should clear session and user when null', () => {
      useAuthStore.setState({
        session: { user: { id: '123' } } as any,
        user: { id: '123' } as any,
      });

      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.setSession(null);
      });

      expect(result.current.session).toBeNull();
      expect(result.current.user).toBeNull();
    });
  });
});

/**
 * Auth Service Unit Tests
 */

import { Platform } from 'react-native';

// Mock modules before imports
const mockSignInWithOAuth = jest.fn();
const mockSignOut = jest.fn();
const mockGetSession = jest.fn();
const mockGetUser = jest.fn();
const mockRefreshSession = jest.fn();
const mockSetSession = jest.fn();
const mockOpenAuthSessionAsync = jest.fn();
const mockMakeRedirectUri = jest.fn();

jest.mock('@/services/supabase', () => ({
  supabase: {
    auth: {
      signInWithOAuth: (params: any) => mockSignInWithOAuth(params),
      signOut: () => mockSignOut(),
      getSession: () => mockGetSession(),
      getUser: () => mockGetUser(),
      refreshSession: () => mockRefreshSession(),
      setSession: (session: any) => mockSetSession(session),
    },
  },
}));

jest.mock('expo-web-browser', () => ({
  maybeCompleteAuthSession: jest.fn(),
  openAuthSessionAsync: (...args: any[]) => mockOpenAuthSessionAsync(...args),
}));

jest.mock('expo-auth-session', () => ({
  makeRedirectUri: (params: any) => mockMakeRedirectUri(params),
}));

jest.mock('expo-linking', () => ({
  createURL: jest.fn(),
}));

// Import after mocks
import {
  signInWithOAuth,
  signOut,
  getSession,
  getUser,
  refreshSession,
  setSessionFromUrl,
} from '@/services/authService';

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockMakeRedirectUri.mockReturnValue('toonnotesexpo://auth/callback');
  });

  describe('signInWithOAuth', () => {
    describe('on web platform', () => {
      beforeEach(() => {
        (Platform as any).OS = 'web';
        // Mock window.location
        Object.defineProperty(global, 'window', {
          value: { location: { origin: 'http://localhost:8081' } },
          writable: true,
        });
      });

      it('should call supabase signInWithOAuth for Google', async () => {
        mockSignInWithOAuth.mockResolvedValue({ data: {}, error: null });

        await signInWithOAuth('google');

        expect(mockSignInWithOAuth).toHaveBeenCalledWith(
          expect.objectContaining({
            provider: 'google',
            options: expect.objectContaining({
              redirectTo: 'http://localhost:8081/auth/callback',
              skipBrowserRedirect: false,
            }),
          })
        );
      });

      it('should call supabase signInWithOAuth for Apple', async () => {
        mockSignInWithOAuth.mockResolvedValue({ data: {}, error: null });

        await signInWithOAuth('apple');

        expect(mockSignInWithOAuth).toHaveBeenCalledWith(
          expect.objectContaining({
            provider: 'apple',
            options: expect.objectContaining({
              redirectTo: 'http://localhost:8081/auth/callback',
            }),
          })
        );
      });

      it('should include Google-specific query params', async () => {
        mockSignInWithOAuth.mockResolvedValue({ data: {}, error: null });

        await signInWithOAuth('google');

        expect(mockSignInWithOAuth).toHaveBeenCalledWith(
          expect.objectContaining({
            options: expect.objectContaining({
              queryParams: {
                access_type: 'offline',
                prompt: 'consent',
              },
            }),
          })
        );
      });

      it('should not include query params for Apple', async () => {
        mockSignInWithOAuth.mockResolvedValue({ data: {}, error: null });

        await signInWithOAuth('apple');

        expect(mockSignInWithOAuth).toHaveBeenCalledWith(
          expect.objectContaining({
            options: expect.objectContaining({
              queryParams: undefined,
            }),
          })
        );
      });

      it('should throw error when OAuth fails', async () => {
        const mockError = { message: 'OAuth error' };
        mockSignInWithOAuth.mockResolvedValue({ data: null, error: mockError });

        await expect(signInWithOAuth('google')).rejects.toEqual(mockError);
      });
    });

    describe('on native platform', () => {
      beforeEach(() => {
        (Platform as any).OS = 'ios';
        delete (global as any).window;
      });

      it('should open browser for OAuth on native', async () => {
        const mockUrl = 'https://supabase.co/auth/v1/authorize?provider=google';
        mockSignInWithOAuth.mockResolvedValue({
          data: { url: mockUrl },
          error: null,
        });
        mockOpenAuthSessionAsync.mockResolvedValue({ type: 'cancel' });

        await expect(signInWithOAuth('google')).rejects.toThrow(
          'Authentication was cancelled'
        );

        expect(mockOpenAuthSessionAsync).toHaveBeenCalledWith(
          mockUrl,
          'toonnotesexpo://auth/callback',
          expect.any(Object)
        );
      });

      it('should set session when OAuth succeeds', async () => {
        const mockUrl = 'https://supabase.co/auth/v1/authorize';
        const callbackUrl =
          'toonnotesexpo://auth/callback#access_token=abc123&refresh_token=def456';

        mockSignInWithOAuth.mockResolvedValue({
          data: { url: mockUrl },
          error: null,
        });
        mockOpenAuthSessionAsync.mockResolvedValue({
          type: 'success',
          url: callbackUrl,
        });
        mockSetSession.mockResolvedValue({ error: null });

        await signInWithOAuth('google');

        expect(mockSetSession).toHaveBeenCalledWith({
          access_token: 'abc123',
          refresh_token: 'def456',
        });
      });

      it('should throw when user cancels', async () => {
        mockSignInWithOAuth.mockResolvedValue({
          data: { url: 'https://auth.url' },
          error: null,
        });
        mockOpenAuthSessionAsync.mockResolvedValue({ type: 'cancel' });

        await expect(signInWithOAuth('google')).rejects.toThrow(
          'Authentication was cancelled'
        );
      });
    });
  });

  describe('signOut', () => {
    it('should call supabase signOut', async () => {
      mockSignOut.mockResolvedValue({ error: null });

      await signOut();

      expect(mockSignOut).toHaveBeenCalled();
    });

    it('should throw error when sign out fails', async () => {
      const mockError = { message: 'Sign out error' };
      mockSignOut.mockResolvedValue({ error: mockError });

      await expect(signOut()).rejects.toEqual(mockError);
    });
  });

  describe('getSession', () => {
    it('should return session when exists', async () => {
      const mockSession = { user: { id: '123' }, access_token: 'token' };
      mockGetSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      const result = await getSession();

      expect(result).toEqual(mockSession);
    });

    it('should return null when no session', async () => {
      mockGetSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });

      const result = await getSession();

      expect(result).toBeNull();
    });

    it('should throw error when getSession fails', async () => {
      const mockError = { message: 'Session error' };
      mockGetSession.mockResolvedValue({
        data: { session: null },
        error: mockError,
      });

      await expect(getSession()).rejects.toEqual(mockError);
    });
  });

  describe('getUser', () => {
    it('should return user when exists', async () => {
      const mockUser = { id: '123', email: 'test@example.com' };
      mockGetUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const result = await getUser();

      expect(result).toEqual(mockUser);
    });

    it('should return null when no user', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const result = await getUser();

      expect(result).toBeNull();
    });
  });

  describe('refreshSession', () => {
    it('should return refreshed session', async () => {
      const mockSession = { user: { id: '123' }, access_token: 'new-token' };
      mockRefreshSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      const result = await refreshSession();

      expect(result).toEqual(mockSession);
    });
  });

  describe('setSessionFromUrl', () => {
    it('should extract tokens from URL hash and set session', async () => {
      const url = 'https://app.com/callback#access_token=abc&refresh_token=xyz';
      mockSetSession.mockResolvedValue({
        data: { session: { access_token: 'abc' } },
        error: null,
      });

      const result = await setSessionFromUrl(url);

      expect(mockSetSession).toHaveBeenCalledWith({
        access_token: 'abc',
        refresh_token: 'xyz',
      });
      expect(result).toEqual({ access_token: 'abc' });
    });

    it('should return null when no hash fragment', async () => {
      const url = 'https://app.com/callback';

      const result = await setSessionFromUrl(url);

      expect(result).toBeNull();
      expect(mockSetSession).not.toHaveBeenCalled();
    });

    it('should return null when missing tokens in hash', async () => {
      const url = 'https://app.com/callback#error=access_denied';

      const result = await setSessionFromUrl(url);

      expect(result).toBeNull();
    });
  });
});

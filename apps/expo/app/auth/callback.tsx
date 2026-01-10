/**
 * OAuth Callback Handler
 *
 * Handles the OAuth redirect on web platform.
 * Extracts tokens from URL hash fragment and sets the session.
 */

import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { setSessionFromUrl } from '@/services/authService';
import { useTheme } from '@/src/theme';
import { useAuthStore } from '@/stores/authStore';

export default function AuthCallbackScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { setSession } = useAuthStore();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    handleCallback();
  }, []);

  const handleCallback = async () => {
    try {
      // Get the current URL (only works on web)
      if (typeof window === 'undefined') {
        // On native, this screen shouldn't be reached directly
        // OAuth callbacks are handled in authService.ts via WebBrowser
        router.replace('/(tabs)');
        return;
      }

      const url = window.location.href;
      console.log('[AuthCallback] Processing callback URL');

      // Check if there's a hash fragment with tokens
      if (window.location.hash) {
        const session = await setSessionFromUrl(url);

        if (session) {
          console.log('[AuthCallback] Session established');
          setSession(session);

          // Small delay to ensure state is updated
          setTimeout(() => {
            router.replace('/(tabs)');
          }, 100);
          return;
        }
      }

      // Check for error in hash
      if (window.location.hash) {
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const errorParam = hashParams.get('error');
        const errorDescription = hashParams.get('error_description');

        if (errorParam) {
          console.error('[AuthCallback] OAuth error:', errorParam, errorDescription);
          setError(errorDescription || errorParam);
          return;
        }
      }

      // No tokens and no error - redirect to auth
      console.log('[AuthCallback] No tokens found, redirecting to auth');
      router.replace('/auth');
    } catch (err) {
      console.error('[AuthCallback] Error processing callback:', err);
      setError(err instanceof Error ? err.message : 'Authentication failed');
    }
  };

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: colors.backgroundPrimary }]}>
        <View style={[styles.errorCard, { backgroundColor: '#FEE2E2' }]}>
          <Text style={styles.errorTitle}>Authentication Failed</Text>
          <Text style={styles.errorText}>{error}</Text>
        </View>
        <Text
          style={[styles.retryLink, { color: colors.accent }]}
          onPress={() => router.replace('/auth')}
        >
          Try again
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundPrimary }]}>
      <ActivityIndicator size="large" color={colors.accent} />
      <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
        Completing sign in...
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorCard: {
    padding: 20,
    borderRadius: 12,
    maxWidth: 320,
    width: '100%',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#DC2626',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#7F1D1D',
    textAlign: 'center',
  },
  retryLink: {
    marginTop: 24,
    fontSize: 16,
    fontWeight: '600',
  },
});

/**
 * Auth Screen
 *
 * Sign-in screen with Google and Apple OAuth options.
 * Apple Sign-In is only shown on iOS and Web (required by App Store when any social login is offered).
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useAuthStore } from '@/stores/authStore';
import { useTheme } from '@/src/theme';
import { isSupabaseConfigured } from '@/services/supabase';

export default function AuthScreen() {
  const { colors, typography, spacing, borderRadius } = useTheme();
  const { signInWithGoogle, signInWithApple, isLoading, error, clearError } =
    useAuthStore();

  const isConfigured = isSupabaseConfigured();

  // Show configuration warning if Supabase is not set up
  if (!isConfigured) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.backgroundPrimary }]}
      >
        <View style={styles.content}>
          <Image
            source={require('@/assets/images/ToonNotes_logo.png')}
            style={styles.logo}
            contentFit="contain"
          />
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            ToonNotes
          </Text>
          <View style={[styles.warningCard, { backgroundColor: colors.surfaceCard }]}>
            <Text style={[styles.warningTitle, { color: colors.textPrimary }]}>
              Setup Required
            </Text>
            <Text style={[styles.warningText, { color: colors.textSecondary }]}>
              Add your Supabase credentials to .env.local:
            </Text>
            <View style={[styles.codeBlock, { backgroundColor: colors.backgroundSecondary }]}>
              <Text style={[styles.codeText, { color: colors.textPrimary }]}>
                EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co{'\n'}
                EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
              </Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.backgroundPrimary }]}
    >
      <View style={styles.content}>
        {/* Logo */}
        <Image
          source={require('@/assets/images/ToonNotes_logo.png')}
          style={styles.logo}
          contentFit="contain"
        />

        {/* App Name */}
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          ToonNotes
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Your creative note-taking companion
        </Text>

        {/* Error Message */}
        {error && (
          <TouchableOpacity
            onPress={clearError}
            style={[styles.errorCard, { backgroundColor: '#FEE2E2' }]}
          >
            <Text style={styles.errorText}>{error}</Text>
            <Text style={styles.errorDismiss}>Tap to dismiss</Text>
          </TouchableOpacity>
        )}

        {/* Sign In Buttons */}
        <View style={styles.buttonsContainer}>
          {/* Google Sign In */}
          <TouchableOpacity
            onPress={signInWithGoogle}
            disabled={isLoading}
            style={[
              styles.button,
              styles.googleButton,
              { borderColor: colors.border },
            ]}
            accessibilityLabel="Continue with Google"
            accessibilityRole="button"
          >
            {isLoading ? (
              <ActivityIndicator color={colors.textPrimary} />
            ) : (
              <>
                <GoogleIcon />
                <Text style={styles.googleButtonText}>Continue with Google</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Apple Sign In (iOS and Web only) */}
          {(Platform.OS === 'ios' || Platform.OS === 'web') && (
            <TouchableOpacity
              onPress={signInWithApple}
              disabled={isLoading}
              style={[styles.button, styles.appleButton]}
              accessibilityLabel="Continue with Apple"
              accessibilityRole="button"
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <AppleIcon />
                  <Text style={styles.appleButtonText}>Continue with Apple</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Terms */}
        <Text style={[styles.terms, { color: colors.textTertiary }]}>
          By continuing, you agree to our Terms of Service and Privacy Policy
        </Text>
      </View>
    </SafeAreaView>
  );
}

// Google Icon Component (SVG as View)
function GoogleIcon() {
  return (
    <View style={styles.iconContainer}>
      <Image
        source={{
          uri: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIyLjU2IDEyLjI1QzIyLjU2IDExLjQ3IDIyLjQ5IDEwLjcyIDIyLjM2IDEwSDE4VjE0LjI1SDIwLjU0QzIwLjMxIDE1LjQyIDE5LjY0IDE2LjQyIDE4LjY2IDE3LjA5VjE5LjU4SDIwLjc0QzIyLjE3IDE4LjI4IDIyLjk5IDE1LjQyIDIyLjU2IDEyLjI1WiIgZmlsbD0iIzQyODVGNCIvPgo8cGF0aCBkPSJNMTIgMjNDMTQuOTcgMjMgMTcuNDYgMjIuMDIgMTkuMjYgMjAuMjdMMTYuMTggMTcuNzhDMTUuMjMgMTguNDQgMTMuOTcgMTguODQgMTIgMTguODRDOS4wOCAxOC44NCA2LjU5IDE2LjcyIDUuNjkgMTRIMi41OFYxNi41OEM0LjM4IDIwLjIxIDcuOTkgMjMgMTIgMjNaIiBmaWxsPSIjMzRBODUzIi8+CjxwYXRoIGQ9Ik01LjY5IDE0QzUuNDcgMTMuMzMgNS4zNCAxMi42MiA1LjM0IDExLjg4QzUuMzQgMTEuMTQgNS40NyAxMC40MyA1LjY5IDkuNzZWNy4xOEgyLjU4QzEuODUgOC42MyAxLjQ0IDEwLjI1IDEuNDQgMTEuODhDMS40NCAxMy41MSAxLjg1IDE1LjEzIDIuNTggMTYuNThMNS42OSAxNFoiIGZpbGw9IiNGQkJDMDUiLz4KPHBhdGggZD0iTTEyIDUuMDRDMTMuNjIgNS4wNCAxNS4wNyA1LjU3IDE2LjIxIDYuNjFMMTkuMzYgMy40NkMxNy40NSAxLjY5IDE0Ljk3IDAuNjQgMTIgMC42NEM3Ljk5IDAuNjQgNC4zOCAzLjQzIDIuNTggNy4wNkw1LjY5IDkuNjRDNi41OSA2LjkyIDkuMDggNC44NCAxMiA0Ljg0VjUuMDRaIiBmaWxsPSIjRUE0MzM1Ii8+Cjwvc3ZnPgo=',
        }}
        style={styles.icon}
        contentFit="contain"
      />
    </View>
  );
}

// Apple Icon Component
function AppleIcon() {
  return (
    <Text style={styles.appleIcon}></Text>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 48,
    textAlign: 'center',
  },
  buttonsContainer: {
    width: '100%',
    maxWidth: 320,
    gap: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    minHeight: 56,
  },
  googleButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F1F1F',
  },
  appleButton: {
    backgroundColor: '#000000',
  },
  appleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  iconContainer: {
    marginRight: 12,
  },
  icon: {
    width: 24,
    height: 24,
  },
  appleIcon: {
    fontSize: 24,
    color: '#FFFFFF',
    marginRight: 12,
  },
  errorCard: {
    width: '100%',
    maxWidth: 320,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    textAlign: 'center',
  },
  errorDismiss: {
    color: '#9CA3AF',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
  terms: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 32,
    paddingHorizontal: 24,
  },
  warningCard: {
    width: '100%',
    maxWidth: 320,
    padding: 20,
    borderRadius: 12,
    marginTop: 24,
  },
  warningTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  warningText: {
    fontSize: 14,
    marginBottom: 12,
    textAlign: 'center',
  },
  codeBlock: {
    padding: 12,
    borderRadius: 8,
  },
  codeText: {
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
});

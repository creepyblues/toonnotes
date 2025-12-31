import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WarningCircle, ArrowCounterClockwise } from 'phosphor-react-native';

interface ErrorBoundaryProps {
  error: Error;
  retry?: () => void;
}

/**
 * Custom error boundary component for ToonNotes.
 * Displays a user-friendly error screen with restart capability.
 *
 * Usage: Export this from app/_layout.tsx as `ErrorBoundary`
 */
export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  const handleRestart = () => {
    // Use the retry function provided by Expo Router's error boundary
    if (retry) {
      retry();
    }
  };

  // Log error for debugging (will be sent to Sentry once configured)
  React.useEffect(() => {
    console.error('ErrorBoundary caught error:', error);
    console.error('Stack trace:', error.stack);

    // TODO: Send to Sentry once configured
    // Sentry.captureException(error);
  }, [error]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Error Icon */}
        <View style={styles.iconContainer}>
          <WarningCircle size={64} color="#EF4444" weight="duotone" />
        </View>

        {/* Error Title */}
        <Text style={styles.title}>Something went wrong</Text>

        {/* Error Message */}
        <Text style={styles.message}>
          We're sorry, but something unexpected happened. Please try restarting
          the app.
        </Text>

        {/* Error Details (only in development) */}
        {__DEV__ && (
          <View style={styles.errorDetails}>
            <Text style={styles.errorName}>{error.name}</Text>
            <Text style={styles.errorMessage}>{error.message}</Text>
          </View>
        )}

        {/* Restart Button */}
        <TouchableOpacity
          style={styles.restartButton}
          onPress={handleRestart}
          activeOpacity={0.8}
          accessibilityLabel="Restart app"
          accessibilityHint="Restarts the app to recover from the error"
          accessibilityRole="button"
        >
          <ArrowCounterClockwise size={20} color="#FFFFFF" weight="bold" />
          <Text style={styles.restartButtonText}>Restart App</Text>
        </TouchableOpacity>

        {/* Retry Button (if available) */}
        {retry && (
          <TouchableOpacity
            style={styles.retryButton}
            onPress={retry}
            activeOpacity={0.8}
            accessibilityLabel="Try again"
            accessibilityHint="Attempts to retry the failed operation"
            accessibilityRole="button"
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0D15',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#F5F3FF',
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    color: '#A8A8B8',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  errorDetails: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  errorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EF4444',
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  errorMessage: {
    fontSize: 12,
    color: '#F87171',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  restartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8B5CF6',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 9999,
    gap: 8,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  restartButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  retryButton: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#A78BFA',
  },
});

export default ErrorBoundary;

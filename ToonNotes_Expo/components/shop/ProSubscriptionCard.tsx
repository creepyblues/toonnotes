/**
 * Pro Subscription Card Component
 *
 * Displays ToonNotes Pro subscription option with benefits.
 * Shows different states: not subscribed, active, expired.
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Crown, Cloud, Coin, Heart, CaretRight, Check } from 'phosphor-react-native';
import { useTheme } from '@/src/theme';

interface ProSubscriptionCardProps {
  isPro: boolean;
  expiresAt: number | null;
  willRenew: boolean;
  priceString: string;
  onSubscribe: () => void;
  onManage: () => void;
  isLoading: boolean;
}

const PRO_BENEFITS = [
  { icon: Cloud, text: 'Cloud backup & sync across devices' },
  { icon: Coin, text: '100 coins every month ($4.99 value)' },
  { icon: Heart, text: 'Support ToonNotes development' },
];

export function ProSubscriptionCard({
  isPro,
  expiresAt,
  willRenew,
  priceString,
  onSubscribe,
  onManage,
  isLoading,
}: ProSubscriptionCardProps) {
  const { colors } = useTheme();

  // Format expiration date
  const formatDate = (timestamp: number | null) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Active Pro subscriber view
  if (isPro) {
    return (
      <View
        style={[
          styles.container,
          styles.activeContainer,
          { backgroundColor: `${colors.accent}15`, borderColor: colors.accent },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.badge, { backgroundColor: colors.accent }]}>
            <Crown size={14} color="#FFFFFF" weight="fill" />
            <Text style={styles.badgeText}>PRO ACTIVE</Text>
          </View>
        </View>

        {/* Status */}
        <View style={styles.statusRow}>
          <Crown size={28} color={colors.accent} weight="fill" />
          <View style={styles.statusText}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>
              ToonNotes Pro
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {willRenew
                ? `Renews ${formatDate(expiresAt)}`
                : `Expires ${formatDate(expiresAt)}`}
            </Text>
          </View>
        </View>

        {/* Manage Button */}
        <TouchableOpacity
          onPress={onManage}
          style={[styles.manageButton, { borderColor: colors.border }]}
          accessibilityLabel="Manage subscription"
          accessibilityRole="button"
        >
          <Text style={[styles.manageButtonText, { color: colors.textSecondary }]}>
            Manage Subscription
          </Text>
          <CaretRight size={16} color={colors.textTertiary} />
        </TouchableOpacity>
      </View>
    );
  }

  // Non-subscriber view
  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.surfaceCard, borderColor: colors.border },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.proHeader]}>
          <Crown size={24} color={colors.accent} weight="fill" />
          <Text style={[styles.proTitle, { color: colors.textPrimary }]}>
            ToonNotes Pro
          </Text>
        </View>
        <Text style={[styles.priceTag, { color: colors.accent }]}>
          {priceString || '$4.99'}/mo
        </Text>
      </View>

      {/* Benefits */}
      <View style={styles.benefits}>
        {PRO_BENEFITS.map((benefit, index) => {
          const IconComponent = benefit.icon;
          return (
            <View key={index} style={styles.benefitRow}>
              <View
                style={[
                  styles.benefitIcon,
                  { backgroundColor: `${colors.accent}15` },
                ]}
              >
                <IconComponent size={16} color={colors.accent} weight="fill" />
              </View>
              <Text style={[styles.benefitText, { color: colors.textSecondary }]}>
                {benefit.text}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Subscribe Button */}
      <TouchableOpacity
        onPress={onSubscribe}
        disabled={isLoading}
        style={[
          styles.subscribeButton,
          { backgroundColor: colors.accent },
          isLoading && styles.disabledButton,
        ]}
        accessibilityLabel="Subscribe to ToonNotes Pro"
        accessibilityRole="button"
        accessibilityHint="Opens subscription purchase flow"
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <>
            <Crown size={18} color="#FFFFFF" weight="fill" />
            <Text style={styles.subscribeButtonText}>
              Subscribe for {priceString || '$4.99'}/mo
            </Text>
          </>
        )}
      </TouchableOpacity>

      {/* Terms */}
      <Text style={[styles.terms, { color: colors.textTertiary }]}>
        Cancel anytime. Subscription auto-renews monthly.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: 2,
    padding: 16,
    marginBottom: 16,
  },
  activeContainer: {
    borderWidth: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  proHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  proTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  priceTag: {
    fontSize: 16,
    fontWeight: '600',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  statusText: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  benefits: {
    gap: 10,
    marginBottom: 16,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  benefitIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitText: {
    fontSize: 14,
    flex: 1,
  },
  subscribeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  disabledButton: {
    opacity: 0.7,
  },
  subscribeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  manageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  manageButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  terms: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 12,
  },
});

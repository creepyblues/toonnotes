/**
 * UpgradeModal Component
 *
 * Soft paywall modal shown when user runs out of free designs.
 * Provides upgrade messaging and coin purchase options.
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Modal,
  Platform,
} from 'react-native';
import { Coin, Gift, Star, Crown, Sparkle, X } from 'phosphor-react-native';
import Constants from 'expo-constants';

import { useUserStore } from '@/stores';
import { FREE_DESIGN_QUOTA } from '@/stores/userStore';
import { useTheme } from '@/src/theme';
import { purchaseService, PurchasesPackage } from '@/services/purchaseService';
import { PRODUCT_CONFIG, getCoinsForProduct, ProductId } from '@/constants/products';
import { generateUUID } from '@/utils/uuid';
import { Purchase } from '@/types';
import {
  trackPaywallDismissed,
  trackPurchaseStarted,
  trackPurchaseCompleted,
  trackPurchaseFailed,
} from '@/utils/analytics';

// Check if running in Expo Go
const isExpoGo = Constants.appOwnership === 'expo';

interface UpgradeModalProps {
  visible: boolean;
  onClose: () => void;
}

export function UpgradeModal({ visible, onClose }: UpgradeModalProps) {
  const { colors, isDark } = useTheme();
  const {
    user,
    addPurchase,
    isProcessingPurchase,
    setProcessingPurchase,
  } = useUserStore();

  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      loadPackages();
    }
  }, [visible]);

  const loadPackages = async () => {
    setLoading(true);
    setError(null);

    if (isExpoGo) {
      setError('EXPO_GO');
      setLoading(false);
      return;
    }

    if (!purchaseService.isInitialized()) {
      setError('Purchase service not configured.');
      setLoading(false);
      return;
    }

    const offering = await purchaseService.getOfferings();
    if (offering?.availablePackages) {
      setPackages(offering.availablePackages);
    } else {
      setError('Unable to load packages.');
    }
    setLoading(false);
  };

  const handlePurchase = async (pkg: PurchasesPackage) => {
    trackPurchaseStarted(pkg.product.identifier);
    setSelectedPackage(pkg.identifier);
    setProcessingPurchase(true);

    const result = await purchaseService.purchasePackage(pkg);

    if (result.success) {
      const purchase: Purchase = {
        id: generateUUID(),
        productId: pkg.product.identifier,
        coinsGranted: result.coinsGranted,
        purchasedAt: Date.now(),
        transactionId: result.transactionId || generateUUID(),
        platform: Platform.OS as 'ios' | 'android',
        priceString: pkg.product.priceString,
        currencyCode: pkg.product.currencyCode,
      };

      addPurchase(purchase);
      trackPurchaseCompleted(
        pkg.product.identifier,
        result.coinsGranted,
        pkg.product.priceString
      );

      Alert.alert(
        'Purchase Complete!',
        `You received ${result.coinsGranted} coins! You can now create designs.`,
        [{ text: 'Continue', onPress: onClose }]
      );
    } else if (!result.userCancelled) {
      trackPurchaseFailed(pkg.product.identifier, result.error || 'Unknown error');
      Alert.alert('Purchase Failed', result.error || 'Please try again.');
    }

    setProcessingPurchase(false);
    setSelectedPackage(null);
  };

  const handleDismiss = () => {
    trackPaywallDismissed();
    onClose();
  };

  const getPackageConfig = (productId: string) => {
    return PRODUCT_CONFIG[productId as ProductId];
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleDismiss}
    >
      <View style={[styles.container, { backgroundColor: colors.backgroundPrimary }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={handleDismiss}
            style={styles.closeButton}
            disabled={isProcessingPurchase}
          >
            <X size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: isDark ? `${colors.accent}20` : '#F5F3FF' },
            ]}
          >
            <Sparkle size={48} color={colors.accent} weight="duotone" />
          </View>
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            You've used all {FREE_DESIGN_QUOTA} free designs!
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Unlock unlimited creativity with coins
          </Text>
        </View>

        {/* Packages */}
        <View style={styles.packagesSection}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.accent} />
              <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                Loading options...
              </Text>
            </View>
          ) : error === 'EXPO_GO' ? (
            <View style={styles.infoContainer}>
              <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                In-app purchases require a development build.
                {'\n'}Run with npx expo run:ios to test.
              </Text>
            </View>
          ) : error ? (
            <View style={styles.infoContainer}>
              <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                {error}
              </Text>
              <TouchableOpacity
                onPress={loadPackages}
                style={[styles.retryButton, { backgroundColor: colors.accent }]}
              >
                <Text style={styles.retryText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.packagesList}>
              {packages.map((pkg) => {
                const config = getPackageConfig(pkg.product.identifier);
                const isSelected = selectedPackage === pkg.identifier;
                const totalCoins = getCoinsForProduct(pkg.product.identifier);

                if (!config) return null;

                return (
                  <TouchableOpacity
                    key={pkg.identifier}
                    onPress={() => handlePurchase(pkg)}
                    disabled={isProcessingPurchase}
                    activeOpacity={0.7}
                    style={[
                      styles.packageCard,
                      {
                        borderColor: config.isBestValue
                          ? colors.accent
                          : config.isMostPopular
                          ? '#10B981'
                          : colors.border,
                        backgroundColor: config.isBestValue
                          ? `${colors.accent}10`
                          : colors.surfaceCard,
                        opacity: isProcessingPurchase && !isSelected ? 0.5 : 1,
                      },
                    ]}
                  >
                    {/* Badge */}
                    {config.isBestValue && (
                      <View style={[styles.badge, { backgroundColor: colors.accent }]}>
                        <Crown size={10} color="#FFFFFF" weight="fill" />
                        <Text style={styles.badgeText}>BEST VALUE</Text>
                      </View>
                    )}
                    {config.isMostPopular && !config.isBestValue && (
                      <View style={[styles.badge, { backgroundColor: '#10B981' }]}>
                        <Star size={10} color="#FFFFFF" weight="fill" />
                        <Text style={styles.badgeText}>POPULAR</Text>
                      </View>
                    )}

                    <View style={styles.packageContent}>
                      <View style={styles.coinInfo}>
                        <Coin size={24} color="#FBBF24" weight="fill" />
                        <Text style={[styles.coinAmount, { color: colors.textPrimary }]}>
                          {totalCoins}
                        </Text>
                        {config.bonusCoins > 0 && (
                          <View style={styles.bonusTag}>
                            <Gift size={12} color="#10B981" weight="fill" />
                            <Text style={styles.bonusText}>+{config.bonusCoins}</Text>
                          </View>
                        )}
                      </View>

                      <View
                        style={[
                          styles.priceButton,
                          {
                            backgroundColor: config.isBestValue
                              ? colors.accent
                              : colors.buttonPrimary,
                          },
                        ]}
                      >
                        {isSelected && isProcessingPurchase ? (
                          <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                          <Text style={styles.priceText}>{pkg.product.priceString}</Text>
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* Maybe Later Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            onPress={handleDismiss}
            disabled={isProcessingPurchase}
            style={styles.laterButton}
          >
            <Text style={[styles.laterText, { color: colors.textSecondary }]}>
              Maybe Later
            </Text>
          </TouchableOpacity>

          <Text style={[styles.footerHint, { color: colors.textTertiary }]}>
            1 coin = 1 custom design
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  closeButton: {
    padding: 8,
  },
  heroSection: {
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 24,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  packagesSection: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
  },
  infoContainer: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  infoText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  packagesList: {
    gap: 12,
  },
  packageCard: {
    borderWidth: 2,
    borderRadius: 16,
    padding: 16,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -10,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  packageContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  coinInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  coinAmount: {
    fontSize: 20,
    fontWeight: '700',
  },
  bonusTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 2,
  },
  bonusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
  },
  priceButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    minWidth: 80,
    alignItems: 'center',
  },
  priceText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  footer: {
    padding: 24,
    alignItems: 'center',
    gap: 12,
  },
  laterButton: {
    padding: 12,
  },
  laterText: {
    fontSize: 16,
    fontWeight: '500',
  },
  footerHint: {
    fontSize: 13,
  },
});

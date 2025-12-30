/**
 * CoinShop Component
 *
 * Bottom sheet displaying available coin packages for purchase.
 * Uses RevenueCat for pricing and purchase handling.
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import { Coin, Gift, ArrowCounterClockwise, Star, Crown, Info } from 'phosphor-react-native';
import Constants from 'expo-constants';

import { BottomSheet } from '@/src/components/sheets/BottomSheet';
import { useUserStore } from '@/stores';
import { useTheme } from '@/src/theme';
import { purchaseService, PurchasesPackage } from '@/services/purchaseService';
import { PRODUCT_CONFIG, getCoinsForProduct, ProductId } from '@/constants/products';
import { generateUUID } from '@/utils/uuid';
import { Purchase } from '@/types';

// Check if running in Expo Go
const isExpoGo = Constants.appOwnership === 'expo';

interface CoinShopProps {
  visible: boolean;
  onClose: () => void;
}

export function CoinShop({ visible, onClose }: CoinShopProps) {
  const { colors } = useTheme();
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

    // Check if running in Expo Go
    if (isExpoGo) {
      setError('EXPO_GO');
      setLoading(false);
      return;
    }

    // Check if RevenueCat is initialized
    if (!purchaseService.isInitialized()) {
      setError('Purchase service not configured. Please check your RevenueCat API keys.');
      setLoading(false);
      return;
    }

    const offering = await purchaseService.getOfferings();
    if (offering?.availablePackages) {
      setPackages(offering.availablePackages);
    } else {
      setError('Unable to load packages. Please try again.');
    }
    setLoading(false);
  };

  const handlePurchase = async (pkg: PurchasesPackage) => {
    setSelectedPackage(pkg.identifier);
    setProcessingPurchase(true);

    const result = await purchaseService.purchasePackage(pkg);

    if (result.success) {
      // Record purchase
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

      Alert.alert(
        'Purchase Complete!',
        `You received ${result.coinsGranted} coins!`,
        [{ text: 'OK', onPress: onClose }]
      );
    } else if (!result.userCancelled) {
      Alert.alert('Purchase Failed', result.error || 'Please try again.');
    }

    setProcessingPurchase(false);
    setSelectedPackage(null);
  };

  const handleRestore = async () => {
    setProcessingPurchase(true);
    const customerInfo = await purchaseService.restorePurchases();
    setProcessingPurchase(false);

    if (customerInfo) {
      Alert.alert(
        'Restore Complete',
        'Note: Coin purchases are consumable and cannot be restored. Only subscriptions can be restored.',
        [{ text: 'OK' }]
      );
    } else {
      Alert.alert('Restore Failed', 'Could not restore purchases. Please try again.');
    }
  };

  const getPackageConfig = (productId: string) => {
    return PRODUCT_CONFIG[productId as ProductId];
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="Get Coins"
      size="large"
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Current Balance */}
        <View
          style={[
            styles.balanceCard,
            { backgroundColor: colors.backgroundSecondary },
          ]}
        >
          <View style={styles.balanceRow}>
            <Coin size={28} color="#FBBF24" weight="fill" />
            <Text style={[styles.balanceAmount, { color: colors.textPrimary }]}>
              {user.coinBalance}
            </Text>
            <Text style={[styles.balanceLabel, { color: colors.textSecondary }]}>
              coins
            </Text>
          </View>
          <Text style={[styles.balanceHint, { color: colors.textTertiary }]}>
            1 coin = 1 custom design
          </Text>
        </View>

        {/* Loading State */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.accent} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              Loading packages...
            </Text>
          </View>
        ) : error === 'EXPO_GO' ? (
          /* Expo Go Notice */
          <View style={styles.expoGoContainer}>
            <Info size={48} color={colors.accent} weight="duotone" />
            <Text style={[styles.expoGoTitle, { color: colors.textPrimary }]}>
              Development Mode
            </Text>
            <Text style={[styles.expoGoText, { color: colors.textSecondary }]}>
              In-app purchases require a development build.
              {'\n\n'}
              Run with{' '}
              <Text style={{ fontFamily: 'JetBrainsMono_400Regular' }}>
                npx expo run:ios
              </Text>
              {' '}or{' '}
              <Text style={{ fontFamily: 'JetBrainsMono_400Regular' }}>
                npx expo run:android
              </Text>
              {' '}to test purchases.
            </Text>
          </View>
        ) : error ? (
          /* Error State */
          <View style={styles.errorContainer}>
            <Text style={[styles.errorText, { color: colors.textSecondary }]}>
              {error}
            </Text>
            <TouchableOpacity
              onPress={loadPackages}
              style={[styles.retryButton, { backgroundColor: colors.accent }]}
            >
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* Package Cards */
          <View style={styles.packagesContainer}>
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
                      <Crown size={12} color="#FFFFFF" weight="fill" />
                      <Text style={styles.badgeText}>BEST VALUE</Text>
                    </View>
                  )}
                  {config.isMostPopular && !config.isBestValue && (
                    <View style={[styles.badge, { backgroundColor: '#10B981' }]}>
                      <Star size={12} color="#FFFFFF" weight="fill" />
                      <Text style={styles.badgeText}>POPULAR</Text>
                    </View>
                  )}

                  <View style={styles.packageContent}>
                    {/* Icon */}
                    <View
                      style={[
                        styles.coinIconContainer,
                        { backgroundColor: `${colors.accent}15` },
                      ]}
                    >
                      <Coin size={28} color="#FBBF24" weight="fill" />
                    </View>

                    {/* Details */}
                    <View style={styles.packageDetails}>
                      <Text
                        style={[styles.packageCoins, { color: colors.textPrimary }]}
                      >
                        {totalCoins} Coins
                      </Text>
                      {config.bonusCoins > 0 && (
                        <View style={styles.bonusRow}>
                          <Gift size={14} color="#10B981" weight="fill" />
                          <Text style={styles.bonusText}>
                            +{config.bonusCoins} bonus
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Price Button */}
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
                        <Text style={styles.priceText}>
                          {pkg.product.priceString}
                        </Text>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Restore Purchases */}
        <TouchableOpacity
          onPress={handleRestore}
          disabled={isProcessingPurchase}
          style={styles.restoreButton}
        >
          <ArrowCounterClockwise size={18} color={colors.textSecondary} />
          <Text style={[styles.restoreText, { color: colors.textSecondary }]}>
            Restore Purchases
          </Text>
        </TouchableOpacity>

        {/* Info Text */}
        <Text style={[styles.infoText, { color: colors.textTertiary }]}>
          Coins are used to create custom AI designs from your images.
          {'\n'}Purchases are non-refundable.
        </Text>
      </ScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 20,
  },
  balanceCard: {
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: '700',
  },
  balanceLabel: {
    fontSize: 18,
    fontWeight: '500',
  },
  balanceHint: {
    fontSize: 13,
    marginTop: 4,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  errorText: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 16,
  },
  expoGoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  expoGoTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  expoGoText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  packagesContainer: {
    gap: 12,
  },
  packageCard: {
    borderRadius: 16,
    borderWidth: 2,
    padding: 16,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -10,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  packageContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coinIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  packageDetails: {
    flex: 1,
    marginLeft: 12,
  },
  packageCoins: {
    fontSize: 18,
    fontWeight: '600',
  },
  bonusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  bonusText: {
    fontSize: 13,
    color: '#10B981',
    fontWeight: '500',
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
    fontSize: 15,
    fontWeight: '600',
  },
  restoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    marginTop: 8,
  },
  restoreText: {
    fontSize: 14,
  },
  infoText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
});

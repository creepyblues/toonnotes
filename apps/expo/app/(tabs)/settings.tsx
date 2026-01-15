import React from 'react';
import { View, Text, Alert, ScrollView, Linking, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Moon,
  Trash,
  Archive,
  Coin,
  Info,
  Palette,
  ArrowCounterClockwise,
  SignOut,
  User,
  Crown,
  Cloud,
  UserMinus,
} from 'phosphor-react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import Constants from 'expo-constants';

import { useUserStore, useNoteStore, useDesignStore } from '@/stores';
import { useAuthStore } from '@/stores/authStore';
import { useTheme } from '@/src/theme';
import { CoinShop } from '@/components/shop/CoinShop';
import { SettingsSection, SettingsRow } from '@/components/settings';
import { isSupabaseConfigured } from '@/services/supabase';
import { purchaseService } from '@/services/purchaseService';

export default function SettingsScreen() {
  const router = useRouter();
  const { colors, isDark, semantic } = useTheme();
  const {
    settings,
    toggleDarkMode,
    user,
    addCoins,
    isPurchaseSheetOpen,
    openPurchaseSheet,
    closePurchaseSheet,
    resetOnboarding,
    onboarding,
    getFreeDesignsRemaining,
    isPro,
  } = useUserStore();
  const { getArchivedNotes, getDeletedNotes, clearUnpinnedNotes, getActiveNotes } = useNoteStore();
  const { designs, clearAllDesigns } = useDesignStore();
  const { user: authUser, signOut, isLoading: isAuthLoading } = useAuthStore();

  const isAuthEnabled = isSupabaseConfigured();

  const archivedCount = getArchivedNotes().length;
  const deletedCount = getDeletedNotes().length;

  // Version display with build number
  const appVersion = Constants.expoConfig?.version ?? '1.0.0';
  const buildNumber = Constants.expoConfig?.ios?.buildNumber ?? '';
  const versionDisplay = buildNumber ? `${appVersion} (${buildNumber})` : appVersion;

  const handleViewArchive = () => {
    router.push('/archive');
  };

  const handleViewTrash = () => {
    router.push('/trash');
  };

  const handleBuyCoins = () => {
    openPurchaseSheet();
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
            } catch (error) {
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This will open a web page where you can request permanent deletion of your account and all data.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          onPress: () => {
            Linking.openURL('https://toonnotes.com/delete-account');
          },
        },
      ]
    );
  };

  const handleManageSubscription = async () => {
    try {
      const managementURL = await purchaseService.getManagementURL();
      if (managementURL) {
        await Linking.openURL(managementURL);
      } else {
        // Fallback to App Store subscriptions
        await Linking.openURL('https://apps.apple.com/account/subscriptions');
      }
    } catch (error) {
      console.error('[Settings] Error opening subscription management:', error);
      Alert.alert('Error', 'Could not open subscription management. Please try again.');
    }
  };

  // Format expiration date for display
  const formatExpirationDate = (timestamp: number | null) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleClearAllDesigns = () => {
    const designCount = designs.length;

    if (designCount === 0) {
      Alert.alert('No Designs to Delete', 'There are no custom designs to delete.');
      return;
    }

    Alert.alert(
      'Clear All Designs',
      `This will permanently delete ${designCount} custom design${designCount === 1 ? '' : 's'}. Label presets will not be affected.\n\nThis action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: () => {
            clearAllDesigns();
            Alert.alert('Done', `Deleted ${designCount} design${designCount === 1 ? '' : 's'}.`);
          },
        },
      ]
    );
  };

  const handleClearUnpinnedNotes = () => {
    const activeNotes = getActiveNotes();
    const unpinnedCount = activeNotes.filter(n => !n.isPinned).length;
    const pinnedCount = activeNotes.filter(n => n.isPinned).length;

    if (unpinnedCount === 0) {
      Alert.alert('No Notes to Delete', 'There are no unpinned notes to delete.');
      return;
    }

    Alert.alert(
      'Clear Unpinned Notes',
      `This will permanently delete ${unpinnedCount} unpinned note${unpinnedCount === 1 ? '' : 's'}. ${pinnedCount} pinned note${pinnedCount === 1 ? '' : 's'} will be kept.\n\nThis action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: () => {
            clearUnpinnedNotes();
            Alert.alert('Done', `Deleted ${unpinnedCount} note${unpinnedCount === 1 ? '' : 's'}. ${pinnedCount} pinned note${pinnedCount === 1 ? '' : 's'} kept.`);
          },
        },
      ]
    );
  };

  const handleResetOnboarding = () => {
    Alert.alert(
      'Reset Onboarding',
      'This will show the welcome carousel and coach marks again on next app launch.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          onPress: () => {
            resetOnboarding();
            Alert.alert('Done', 'Onboarding reset. Restart the app to see the welcome screen again.');
          },
        },
      ]
    );
  };

  const handleAddCoins = () => {
    addCoins(100);
    Alert.alert('Success', 'Added 100 coins!');
  };

  // Render user avatar for profile section
  const renderUserAvatar = () => {
    if (authUser?.user_metadata?.avatar_url) {
      return (
        <Image
          source={{ uri: authUser.user_metadata.avatar_url }}
          style={styles.avatar}
          contentFit="cover"
        />
      );
    }
    return (
      <View style={[styles.avatarPlaceholder, { backgroundColor: `${colors.accent}20` }]}>
        <User size={24} color={colors.accent} weight="regular" />
      </View>
    );
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.backgroundSecondary }}
      edges={['top']}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.backgroundSecondary }]}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          Settings
        </Text>
      </View>

      {/* Settings List */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* User Profile Section (only if auth is enabled) */}
        {isAuthEnabled && authUser && (
          <SettingsSection title="Profile">
            {/* User Info Row - custom leftContent for avatar */}
            <SettingsRow
              icon={<User size={20} weight="regular" />}
              iconColor={colors.accent}
              leftContent={renderUserAvatar()}
              label={authUser.user_metadata?.full_name || authUser.user_metadata?.name || 'ToonNotes User'}
              subtitle={authUser.email}
              accessory="none"
              showSeparator
            />
            <SettingsRow
              icon={<SignOut size={20} weight="regular" />}
              iconColor={semantic.error}
              label="Sign Out"
              onPress={handleSignOut}
              isDestructive
              isLoading={isAuthLoading}
              accessory="none"
              showSeparator
            />
            <SettingsRow
              icon={<UserMinus size={20} weight="regular" />}
              iconColor={semantic.error}
              label="Delete Account"
              onPress={handleDeleteAccount}
              isDestructive
              accessory="chevron"
            />
          </SettingsSection>
        )}

        {/* Subscription Section */}
        <SettingsSection title="Subscription" marginTop={isAuthEnabled && authUser ? 24 : 0}>
          {isPro() ? (
            <>
              {/* Active Pro Status */}
              <SettingsRow
                icon={<Crown size={20} weight="fill" />}
                iconColor={colors.accent}
                label="ToonNotes Pro"
                subtitle={user.subscription.willRenew
                  ? `Renews ${formatExpirationDate(user.subscription.expiresAt)}`
                  : `Expires ${formatExpirationDate(user.subscription.expiresAt)}`}
                badge={{ text: 'ACTIVE', color: colors.accent }}
                accessory="none"
                showSeparator
              />
              {/* Pro Benefits */}
              <View style={[styles.benefitRow, { borderBottomWidth: 0.5, borderBottomColor: colors.separator }]}>
                <Cloud size={16} color={colors.accent} weight="fill" />
                <Text style={[styles.benefitText, { color: colors.textSecondary }]}>
                  Cloud sync enabled
                </Text>
              </View>
              {/* Manage Subscription */}
              <SettingsRow
                icon={<Crown size={20} weight="regular" />}
                iconColor={colors.textSecondary}
                iconBackgroundColor="transparent"
                label="Manage Subscription"
                onPress={handleManageSubscription}
                accessory="chevron"
              />
            </>
          ) : (
            /* Non-Pro: Upgrade Prompt */
            <SettingsRow
              icon={<Crown size={20} weight="regular" />}
              iconColor={colors.accent}
              label="ToonNotes Pro"
              subtitle="Cloud sync + 100 coins/month"
              onPress={handleBuyCoins}
              accessory="chevron"
            />
          )}
        </SettingsSection>

        {/* Economy Section */}
        <SettingsSection title="Economy">
          <SettingsRow
            icon={<Coin size={20} weight="regular" />}
            iconColor="#FBBF24"
            label="Coins"
            value={user.coinBalance}
            onPress={handleBuyCoins}
            accessory="chevron"
          />
        </SettingsSection>

        {/* Appearance Section */}
        <SettingsSection title="Appearance">
          <SettingsRow
            icon={<Moon size={20} weight="regular" />}
            iconColor={colors.accent}
            label="Dark Mode"
            accessory="switch"
            switchValue={settings.darkMode}
            onSwitchChange={toggleDarkMode}
          />
        </SettingsSection>

        {/* Notes Section */}
        <SettingsSection title="Notes">
          <SettingsRow
            icon={<Archive size={20} weight="regular" />}
            iconColor="#34C759"
            label="Archive"
            value={archivedCount}
            onPress={handleViewArchive}
            accessory="chevron"
            showSeparator
          />
          <SettingsRow
            icon={<Trash size={20} weight="regular" />}
            iconColor={semantic.error}
            label="Trash"
            value={deletedCount}
            onPress={handleViewTrash}
            accessory="chevron"
          />
        </SettingsSection>

        {/* About Section */}
        <SettingsSection title="About">
          <SettingsRow
            icon={<Info size={20} weight="regular" />}
            iconColor={colors.textSecondary}
            label="Version"
            value={versionDisplay}
            accessory="none"
          />
        </SettingsSection>

        {/* Free design indicator */}
        {getFreeDesignsRemaining() > 0 && (
          <View style={[styles.freeDesignsCard, { backgroundColor: `${colors.accent}15` }]}>
            <Text style={[styles.freeDesignsTitle, { color: colors.accent }]}>
              {getFreeDesignsRemaining()} of 3 Free Designs Remaining
            </Text>
            <Text style={[styles.freeDesignsSubtitle, { color: colors.accentLight }]}>
              Create custom designs for free!
            </Text>
          </View>
        )}

        {/* Debug Section - Admin only */}
        {authUser?.email === 'creepyblues@gmail.com' && (
          <SettingsSection title="Debug">
            <SettingsRow
              icon={<Coin size={20} weight="regular" />}
              iconColor="#34C759"
              label="Add 100 Coins"
              onPress={handleAddCoins}
              accessory="chevron"
              showSeparator
            />
            <SettingsRow
              icon={<Trash size={20} weight="regular" />}
              iconColor={semantic.error}
              label="Clear Unpinned Notes"
              onPress={handleClearUnpinnedNotes}
              accessory="chevron"
              showSeparator
            />
            <SettingsRow
              icon={<Palette size={20} weight="regular" />}
              iconColor="#FF9500"
              label="Clear All Designs"
              onPress={handleClearAllDesigns}
              accessory="chevron"
              showSeparator
            />
            <SettingsRow
              icon={<ArrowCounterClockwise size={20} weight="regular" />}
              iconColor="#5856D6"
              label="Reset Onboarding"
              value={onboarding.hasCompletedWelcome ? 'Completed' : 'Not started'}
              valueColor={colors.textSecondary}
              onPress={handleResetOnboarding}
              accessory="chevron"
            />
          </SettingsSection>
        )}

        {/* Bottom spacing */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Coin Shop */}
      <CoinShop
        visible={isPurchaseSheetOpen}
        onClose={closePurchaseSheet}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  benefitText: {
    fontSize: 14,
    marginLeft: 8,
  },
  freeDesignsCard: {
    marginTop: 24,
    padding: 16,
    borderRadius: 16,
  },
  freeDesignsTitle: {
    fontWeight: '600',
  },
  freeDesignsSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  bottomSpacer: {
    height: 32,
  },
});

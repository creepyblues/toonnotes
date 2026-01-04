import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Switch, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Moon,
  Trash,
  Archive,
  Coin,
  Info,
  CaretRight,
  Palette,
  ArrowCounterClockwise,
  SignOut,
  User,
} from 'phosphor-react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';

import { useUserStore, useNoteStore, useDesignStore } from '@/stores';
import { useAuthStore } from '@/stores/authStore';
import { useTheme } from '@/src/theme';
import { CoinShop } from '@/components/shop/CoinShop';
import { isSupabaseConfigured } from '@/services/supabase';

export default function SettingsScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
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
  } = useUserStore();
  const { getArchivedNotes, getDeletedNotes, clearUnpinnedNotes, getActiveNotes } = useNoteStore();
  const { designs, clearAllDesigns } = useDesignStore();
  const { user: authUser, signOut, isLoading: isAuthLoading } = useAuthStore();

  const isAuthEnabled = isSupabaseConfigured();

  const archivedCount = getArchivedNotes().length;
  const deletedCount = getDeletedNotes().length;

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

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: colors.backgroundSecondary }}
      edges={['top']}
    >
      {/* Header */}
      <View
        className="px-4 py-3"
        style={{ backgroundColor: colors.backgroundSecondary }}
      >
        <Text
          style={{
            fontSize: 34,
            fontWeight: '700',
            color: colors.textPrimary,
          }}
        >
          Settings
        </Text>
      </View>

      {/* Settings List */}
      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        {/* User Profile Section (only if auth is enabled) */}
        {isAuthEnabled && authUser && (
          <View className="mt-6">
            <Text
              className="text-xs uppercase tracking-wider px-2 mb-2"
              style={{ color: colors.textSecondary }}
            >
              Profile
            </Text>
            <View style={{ backgroundColor: colors.surfaceCard, borderRadius: 12 }}>
              {/* User Info */}
              <View className="flex-row items-center px-4 py-4" style={{ borderBottomWidth: 0.5, borderBottomColor: colors.separator }}>
                {authUser.user_metadata?.avatar_url ? (
                  <Image
                    source={{ uri: authUser.user_metadata.avatar_url }}
                    style={{ width: 48, height: 48, borderRadius: 24 }}
                    contentFit="cover"
                  />
                ) : (
                  <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: `${colors.accent}20`, alignItems: 'center', justifyContent: 'center' }}>
                    <User size={24} color={colors.accent} weight="regular" />
                  </View>
                )}
                <View className="ml-3 flex-1">
                  <Text style={{ color: colors.textPrimary, fontSize: 17, fontWeight: '600' }}>
                    {authUser.user_metadata?.full_name || authUser.user_metadata?.name || 'ToonNotes User'}
                  </Text>
                  <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
                    {authUser.email}
                  </Text>
                </View>
              </View>

              {/* Sign Out */}
              <TouchableOpacity
                onPress={handleSignOut}
                disabled={isAuthLoading}
                className="flex-row items-center justify-between px-4 py-3"
              >
                <View className="flex-row items-center">
                  <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: 'rgba(255, 59, 48, 0.15)', alignItems: 'center', justifyContent: 'center' }}>
                    <SignOut size={20} color="#FF3B30" weight="regular" />
                  </View>
                  <Text className="ml-3" style={{ color: '#FF3B30', fontSize: 17 }}>Sign Out</Text>
                </View>
                {isAuthLoading && <ActivityIndicator size="small" color="#FF3B30" />}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Coins Section */}
        <View className="mt-6">
          <Text
            className="text-xs uppercase tracking-wider px-2 mb-2"
            style={{ color: colors.textSecondary }}
          >
            Economy
          </Text>
          <View style={{ backgroundColor: colors.surfaceCard, borderRadius: 12 }}>
            <TouchableOpacity
              onPress={handleBuyCoins}
              className="flex-row items-center justify-between px-4 py-3"
            >
              <View className="flex-row items-center">
                <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: 'rgba(251, 191, 36, 0.15)', alignItems: 'center', justifyContent: 'center' }}>
                  <Coin size={20} color="#FBBF24" weight="regular" />
                </View>
                <Text className="ml-3" style={{ color: colors.textPrimary, fontSize: 17 }}>Coins</Text>
              </View>
              <View className="flex-row items-center">
                <Text className="mr-2" style={{ color: colors.textSecondary, fontSize: 17 }}>{user.coinBalance}</Text>
                <CaretRight size={16} color={colors.textTertiary} weight="regular" />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Appearance Section */}
        <View className="mt-6">
          <Text
            className="text-xs uppercase tracking-wider px-2 mb-2"
            style={{ color: colors.textSecondary }}
          >
            Appearance
          </Text>
          <View style={{ backgroundColor: colors.surfaceCard, borderRadius: 12 }}>
            <View className="flex-row items-center justify-between px-4 py-3">
              <View className="flex-row items-center">
                <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: `${colors.accent}20`, alignItems: 'center', justifyContent: 'center' }}>
                  <Moon size={20} color={colors.accent} weight="regular" />
                </View>
                <Text className="ml-3" style={{ color: colors.textPrimary, fontSize: 17 }}>Dark Mode</Text>
              </View>
              <Switch
                value={settings.darkMode}
                onValueChange={toggleDarkMode}
                trackColor={{ false: colors.border, true: colors.accent }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </View>

        {/* Notes Section */}
        <View className="mt-6">
          <Text
            className="text-xs uppercase tracking-wider px-2 mb-2"
            style={{ color: colors.textSecondary }}
          >
            Notes
          </Text>
          <View style={{ backgroundColor: colors.surfaceCard, borderRadius: 12 }}>
            <TouchableOpacity
              onPress={handleViewArchive}
              className="flex-row items-center justify-between px-4 py-3"
              style={{ borderBottomWidth: 0.5, borderBottomColor: colors.separator }}
            >
              <View className="flex-row items-center">
                <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: 'rgba(52, 199, 89, 0.15)', alignItems: 'center', justifyContent: 'center' }}>
                  <Archive size={20} color="#34C759" weight="regular" />
                </View>
                <Text className="ml-3" style={{ color: colors.textPrimary, fontSize: 17 }}>Archive</Text>
              </View>
              <View className="flex-row items-center">
                <Text className="mr-2" style={{ color: colors.textSecondary, fontSize: 17 }}>{archivedCount}</Text>
                <CaretRight size={16} color={colors.textTertiary} weight="regular" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleViewTrash}
              className="flex-row items-center justify-between px-4 py-3"
            >
              <View className="flex-row items-center">
                <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: 'rgba(255, 59, 48, 0.15)', alignItems: 'center', justifyContent: 'center' }}>
                  <Trash size={20} color="#FF3B30" weight="regular" />
                </View>
                <Text className="ml-3" style={{ color: colors.textPrimary, fontSize: 17 }}>Trash</Text>
              </View>
              <View className="flex-row items-center">
                <Text className="mr-2" style={{ color: colors.textSecondary, fontSize: 17 }}>{deletedCount}</Text>
                <CaretRight size={16} color={colors.textTertiary} weight="regular" />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* About Section */}
        <View className="mt-6">
          <Text
            className="text-xs uppercase tracking-wider px-2 mb-2"
            style={{ color: colors.textSecondary }}
          >
            About
          </Text>
          <View style={{ backgroundColor: colors.surfaceCard, borderRadius: 12 }}>
            <View className="flex-row items-center justify-between px-4 py-3">
              <View className="flex-row items-center">
                <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: `${colors.textSecondary}20`, alignItems: 'center', justifyContent: 'center' }}>
                  <Info size={20} color={colors.textSecondary} weight="regular" />
                </View>
                <Text className="ml-3" style={{ color: colors.textPrimary, fontSize: 17 }}>Version</Text>
              </View>
              <Text style={{ color: colors.textSecondary, fontSize: 17 }}>1.0.0</Text>
            </View>
          </View>
        </View>

        {/* Free design indicator */}
        {getFreeDesignsRemaining() > 0 && (
          <View
            className="mt-6 p-4 rounded-2xl"
            style={{ backgroundColor: `${colors.accent}15` }}
          >
            <Text style={{ color: colors.accent, fontWeight: '600' }}>
              {getFreeDesignsRemaining()} of 3 Free Designs Remaining
            </Text>
            <Text style={{ color: colors.accentLight, fontSize: 14, marginTop: 4 }}>
              Create custom designs for free!
            </Text>
          </View>
        )}

        {/* Debug Section - Admin only */}
        {authUser?.email === 'creepyblues@gmail.com' && (
          <View className="mt-6 mb-8">
            <Text
              className="text-xs uppercase tracking-wider px-2 mb-2"
              style={{ color: colors.textSecondary }}
            >
              Debug
            </Text>
            <View style={{ backgroundColor: colors.surfaceCard, borderRadius: 12 }}>
              <TouchableOpacity
                onPress={() => {
                  addCoins(100);
                  Alert.alert('Success', 'Added 100 coins!');
                }}
                className="flex-row items-center justify-between px-4 py-3"
                style={{ borderBottomWidth: 0.5, borderBottomColor: colors.separator }}
              >
                <View className="flex-row items-center">
                  <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: 'rgba(52, 199, 89, 0.15)', alignItems: 'center', justifyContent: 'center' }}>
                    <Coin size={20} color="#34C759" weight="regular" />
                  </View>
                  <Text className="ml-3" style={{ color: colors.textPrimary, fontSize: 17 }}>Add 100 Coins</Text>
                </View>
                <CaretRight size={16} color={colors.textTertiary} weight="regular" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleClearUnpinnedNotes}
                className="flex-row items-center justify-between px-4 py-3"
                style={{ borderBottomWidth: 0.5, borderBottomColor: colors.separator }}
              >
                <View className="flex-row items-center">
                  <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: 'rgba(255, 59, 48, 0.15)', alignItems: 'center', justifyContent: 'center' }}>
                    <Trash size={20} color="#FF3B30" weight="regular" />
                  </View>
                  <Text className="ml-3" style={{ color: colors.textPrimary, fontSize: 17 }}>Clear Unpinned Notes</Text>
                </View>
                <CaretRight size={16} color={colors.textTertiary} weight="regular" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleClearAllDesigns}
                className="flex-row items-center justify-between px-4 py-3"
                style={{ borderBottomWidth: 0.5, borderBottomColor: colors.separator }}
              >
                <View className="flex-row items-center">
                  <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: 'rgba(255, 149, 0, 0.15)', alignItems: 'center', justifyContent: 'center' }}>
                    <Palette size={20} color="#FF9500" weight="regular" />
                  </View>
                  <Text className="ml-3" style={{ color: colors.textPrimary, fontSize: 17 }}>Clear All Designs</Text>
                </View>
                <CaretRight size={16} color={colors.textTertiary} weight="regular" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
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
                }}
                className="flex-row items-center justify-between px-4 py-3"
              >
                <View className="flex-row items-center">
                  <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: 'rgba(88, 86, 214, 0.15)', alignItems: 'center', justifyContent: 'center' }}>
                    <ArrowCounterClockwise size={20} color="#5856D6" weight="regular" />
                  </View>
                  <Text className="ml-3" style={{ color: colors.textPrimary, fontSize: 17 }}>Reset Onboarding</Text>
                </View>
                <View className="flex-row items-center">
                  <Text className="mr-2" style={{ color: colors.textSecondary, fontSize: 13 }}>
                    {onboarding.hasCompletedWelcome ? 'Completed' : 'Not started'}
                  </Text>
                  <CaretRight size={16} color={colors.textTertiary} weight="regular" />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Coin Shop */}
      <CoinShop
        visible={isPurchaseSheetOpen}
        onClose={closePurchaseSheet}
      />
    </SafeAreaView>
  );
}

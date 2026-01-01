import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Switch, Alert, TextInput, Modal, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Moon,
  Trash,
  Archive,
  Coin,
  Info,
  CaretRight,
  Key,
  X,
  Palette,
  ArrowCounterClockwise,
} from 'phosphor-react-native';
import { useRouter } from 'expo-router';

import { useUserStore, useNoteStore, useDesignStore } from '@/stores';
import { useTheme } from '@/src/theme';
import { CoinShop } from '@/components/shop/CoinShop';

export default function SettingsScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const {
    settings,
    toggleDarkMode,
    user,
    addCoins,
    apiKeyLoaded,
    apiKeyMasked,
    loadApiKey,
    saveGeminiApiKey,
    clearGeminiApiKey,
    hasApiKey,
    isPurchaseSheetOpen,
    openPurchaseSheet,
    closePurchaseSheet,
    resetOnboarding,
    onboarding,
  } = useUserStore();
  const { getArchivedNotes, getDeletedNotes, clearUnpinnedNotes, getActiveNotes } = useNoteStore();
  const { designs, clearAllDesigns } = useDesignStore();
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Load API key from secure storage on mount
  useEffect(() => {
    if (!apiKeyLoaded) {
      loadApiKey();
    }
  }, [apiKeyLoaded, loadApiKey]);

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

  const handleSaveApiKey = async () => {
    setIsSaving(true);
    try {
      const success = await saveGeminiApiKey(apiKeyInput);
      if (success) {
        setShowApiKeyModal(false);
        setApiKeyInput('');
        Alert.alert('Success', 'API key saved securely!');
      } else {
        Alert.alert(
          'Invalid API Key',
          'Please enter a valid Gemini API key. It should start with "AIza" and contain only alphanumeric characters.'
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save API key. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearApiKey = async () => {
    Alert.alert(
      'Clear API Key',
      'Are you sure you want to remove your API key?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await clearGeminiApiKey();
            setShowApiKeyModal(false);
            Alert.alert('Success', 'API key removed.');
          },
        },
      ]
    );
  };

  const handleOpenApiKeyModal = () => {
    setApiKeyInput(''); // Don't pre-fill for security
    setShowApiKeyModal(true);
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
        {/* Account Section */}
        <View className="mt-6">
          <Text
            className="text-xs uppercase tracking-wider px-2 mb-2"
            style={{ color: colors.textSecondary }}
          >
            Account
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

        {/* API Section */}
        <View className="mt-6">
          <Text
            className="text-xs uppercase tracking-wider px-2 mb-2"
            style={{ color: colors.textSecondary }}
          >
            AI Configuration
          </Text>
          <View style={{ backgroundColor: colors.surfaceCard, borderRadius: 12 }}>
            <TouchableOpacity
              onPress={handleOpenApiKeyModal}
              className="flex-row items-center justify-between px-4 py-3"
            >
              <View className="flex-row items-center">
                <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: `${colors.accent}20`, alignItems: 'center', justifyContent: 'center' }}>
                  <Key size={20} color={colors.accent} weight="regular" />
                </View>
                <Text className="ml-3" style={{ color: colors.textPrimary, fontSize: 17 }}>Gemini API Key</Text>
              </View>
              <View className="flex-row items-center">
                <Text className="mr-2" style={{ color: colors.textSecondary, fontSize: 15 }}>
                  {!apiKeyLoaded ? 'Loading...' : apiKeyMasked || 'Not set'}
                </Text>
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
        {!user.freeDesignUsed && (
          <View
            className="mt-6 p-4 rounded-2xl"
            style={{ backgroundColor: `${colors.accent}15` }}
          >
            <Text style={{ color: colors.accent, fontWeight: '600' }}>
              Free Design Available
            </Text>
            <Text style={{ color: colors.accentLight, fontSize: 14, marginTop: 4 }}>
              Create your first custom design for free!
            </Text>
          </View>
        )}

        {/* Debug Section */}
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
      </ScrollView>

      {/* API Key Modal */}
      <Modal
        visible={showApiKeyModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowApiKeyModal(false)}
      >
        <View className="flex-1 items-center justify-center" style={{ backgroundColor: colors.overlayDark }}>
          <View
            className="w-[90%] max-w-[400px] rounded-2xl p-6"
            style={{ backgroundColor: colors.surfaceElevated }}
          >
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-semibold" style={{ color: colors.textPrimary }}>
                Gemini API Key
              </Text>
              <TouchableOpacity
                onPress={() => setShowApiKeyModal(false)}
                style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: colors.backgroundSecondary, alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={18} color={colors.textSecondary} weight="regular" />
              </TouchableOpacity>
            </View>

            <Text className="mb-3" style={{ color: colors.textSecondary }}>
              Enter your Gemini API key to enable AI-powered design generation.
            </Text>

            {hasApiKey() && (
              <Text className="mb-3 text-xs" style={{ color: '#34C759' }}>
                Current key: {apiKeyMasked}
              </Text>
            )}

            <TextInput
              className="rounded-xl px-4 py-3 mb-4"
              style={{
                backgroundColor: colors.backgroundSecondary,
                color: colors.textPrimary,
                borderWidth: 1,
                borderColor: colors.border,
              }}
              placeholder={hasApiKey() ? 'Enter new API key...' : 'AIza...'}
              placeholderTextColor={colors.textTertiary}
              value={apiKeyInput}
              onChangeText={setApiKeyInput}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isSaving}
            />

            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setShowApiKeyModal(false)}
                className="flex-1 py-3 rounded-xl items-center"
                style={{ backgroundColor: colors.buttonSecondary }}
                disabled={isSaving}
              >
                <Text className="font-medium" style={{ color: colors.textPrimary }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSaveApiKey}
                className="flex-1 py-3 rounded-xl items-center"
                disabled={isSaving || !apiKeyInput.trim()}
                style={{ backgroundColor: colors.buttonPrimary, opacity: isSaving || !apiKeyInput.trim() ? 0.5 : 1 }}
              >
                {isSaving ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text className="text-white font-semibold">Save</Text>
                )}
              </TouchableOpacity>
            </View>

            {hasApiKey() && (
              <TouchableOpacity
                onPress={handleClearApiKey}
                className="mt-4 py-2 items-center"
                disabled={isSaving}
              >
                <Text style={{ color: '#FF3B30', fontSize: 14, fontWeight: '500' }}>Remove API Key</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>

      {/* Coin Shop */}
      <CoinShop
        visible={isPurchaseSheetOpen}
        onClose={closePurchaseSheet}
      />
    </SafeAreaView>
  );
}

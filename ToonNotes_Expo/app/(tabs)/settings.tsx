import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Switch, Alert, TextInput, Modal, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Moon,
  Trash2,
  Archive,
  Coins,
  Info,
  ChevronRight,
  Key,
  X,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';

import { useUserStore, useNoteStore } from '@/stores';
import { NoteColor } from '@/types';

export default function SettingsScreen() {
  const router = useRouter();
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
  } = useUserStore();
  const { getArchivedNotes, getDeletedNotes } = useNoteStore();
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const isDark = settings.darkMode;

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
    // TODO: Open coin shop
    Alert.alert('Coming Soon', 'In-app purchases will be available soon!');
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

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: isDark ? '#121212' : '#F9FAFB' }}
      edges={['top']}
    >
      {/* Header */}
      <View
        className="px-4 py-3 border-b"
        style={{
          backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
          borderBottomColor: isDark ? '#2D2D2D' : '#F3F4F6'
        }}
      >
        <Text
          className="text-2xl font-bold"
          style={{ color: isDark ? '#FFFFFF' : '#1F2937' }}
        >
          Settings
        </Text>
      </View>

      {/* Settings List */}
      <View className="flex-1">
        {/* Account Section */}
        <View className="mt-6">
          <Text className="text-xs uppercase tracking-wider px-4 mb-2" style={{ color: '#9CA3AF' }}>
            Account
          </Text>
          <View style={{ backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF' }}>
            <TouchableOpacity
              onPress={handleBuyCoins}
              className="flex-row items-center justify-between px-4 py-4 border-b"
              style={{ borderBottomColor: isDark ? '#2D2D2D' : '#F3F4F6' }}
            >
              <View className="flex-row items-center">
                <Coins size={20} color="#F59E0B" />
                <Text className="ml-3" style={{ color: isDark ? '#FFFFFF' : '#1F2937' }}>Coins</Text>
              </View>
              <View className="flex-row items-center">
                <Text className="mr-2" style={{ color: isDark ? '#9CA3AF' : '#4B5563' }}>{user.coinBalance}</Text>
                <ChevronRight size={20} color="#9CA3AF" />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* API Section */}
        <View className="mt-6">
          <Text className="text-xs uppercase tracking-wider px-4 mb-2" style={{ color: '#9CA3AF' }}>
            AI Configuration
          </Text>
          <View style={{ backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF' }}>
            <TouchableOpacity
              onPress={handleOpenApiKeyModal}
              className="flex-row items-center justify-between px-4 py-4"
            >
              <View className="flex-row items-center">
                <Key size={20} color="#0ea5e9" />
                <Text className="ml-3" style={{ color: isDark ? '#FFFFFF' : '#1F2937' }}>Gemini API Key</Text>
              </View>
              <View className="flex-row items-center">
                <Text className="mr-2" style={{ color: isDark ? '#9CA3AF' : '#4B5563' }}>
                  {!apiKeyLoaded ? 'Loading...' : apiKeyMasked || 'Not set'}
                </Text>
                <ChevronRight size={20} color="#9CA3AF" />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Appearance Section */}
        <View className="mt-6">
          <Text className="text-xs uppercase tracking-wider px-4 mb-2" style={{ color: '#9CA3AF' }}>
            Appearance
          </Text>
          <View style={{ backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF' }}>
            <View className="flex-row items-center justify-between px-4 py-4">
              <View className="flex-row items-center">
                <Moon size={20} color="#6366F1" />
                <Text className="ml-3" style={{ color: isDark ? '#FFFFFF' : '#1F2937' }}>Dark Mode</Text>
              </View>
              <Switch
                value={settings.darkMode}
                onValueChange={toggleDarkMode}
                trackColor={{ false: '#E5E7EB', true: '#6366F1' }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </View>

        {/* Notes Section */}
        <View className="mt-6">
          <Text className="text-xs uppercase tracking-wider px-4 mb-2" style={{ color: '#9CA3AF' }}>
            Notes
          </Text>
          <View style={{ backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF' }}>
            <TouchableOpacity
              onPress={handleViewArchive}
              className="flex-row items-center justify-between px-4 py-4 border-b"
              style={{ borderBottomColor: isDark ? '#2D2D2D' : '#F3F4F6' }}
            >
              <View className="flex-row items-center">
                <Archive size={20} color="#10B981" />
                <Text className="ml-3" style={{ color: isDark ? '#FFFFFF' : '#1F2937' }}>Archive</Text>
              </View>
              <View className="flex-row items-center">
                <Text className="mr-2" style={{ color: isDark ? '#9CA3AF' : '#4B5563' }}>{archivedCount}</Text>
                <ChevronRight size={20} color="#9CA3AF" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleViewTrash}
              className="flex-row items-center justify-between px-4 py-4"
            >
              <View className="flex-row items-center">
                <Trash2 size={20} color="#EF4444" />
                <Text className="ml-3" style={{ color: isDark ? '#FFFFFF' : '#1F2937' }}>Trash</Text>
              </View>
              <View className="flex-row items-center">
                <Text className="mr-2" style={{ color: isDark ? '#9CA3AF' : '#4B5563' }}>{deletedCount}</Text>
                <ChevronRight size={20} color="#9CA3AF" />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* About Section */}
        <View className="mt-6">
          <Text className="text-xs uppercase tracking-wider px-4 mb-2" style={{ color: '#9CA3AF' }}>
            About
          </Text>
          <View style={{ backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF' }}>
            <View className="flex-row items-center justify-between px-4 py-4">
              <View className="flex-row items-center">
                <Info size={20} color="#6B7280" />
                <Text className="ml-3" style={{ color: isDark ? '#FFFFFF' : '#1F2937' }}>Version</Text>
              </View>
              <Text style={{ color: '#9CA3AF' }}>1.0.0</Text>
            </View>
          </View>
        </View>

        {/* Free design indicator */}
        {!user.freeDesignUsed && (
          <View
            className="mt-6 mx-4 p-4 rounded-xl"
            style={{ backgroundColor: isDark ? '#0c4a6e' : '#f0f9ff' }}
          >
            <Text style={{ color: isDark ? '#7dd3fc' : '#0369a1', fontWeight: '600' }}>
              Free Design Available
            </Text>
            <Text style={{ color: isDark ? '#38bdf8' : '#0284c7', fontSize: 14, marginTop: 4 }}>
              Create your first custom design for free!
            </Text>
          </View>
        )}

        {/* Debug Section */}
        <View className="mt-6">
          <Text className="text-xs uppercase tracking-wider px-4 mb-2" style={{ color: '#9CA3AF' }}>
            Debug
          </Text>
          <View style={{ backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF' }}>
            <TouchableOpacity
              onPress={() => {
                addCoins(100);
                Alert.alert('Success', 'Added 100 coins!');
              }}
              className="flex-row items-center justify-between px-4 py-4"
            >
              <View className="flex-row items-center">
                <Coins size={20} color="#10B981" />
                <Text className="ml-3" style={{ color: isDark ? '#FFFFFF' : '#1F2937' }}>Add 100 Coins</Text>
              </View>
              <ChevronRight size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* API Key Modal */}
      <Modal
        visible={showApiKeyModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowApiKeyModal(false)}
      >
        <View className="flex-1 items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View
            className="w-[90%] max-w-[400px] rounded-2xl p-6"
            style={{ backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF' }}
          >
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-semibold" style={{ color: isDark ? '#FFFFFF' : '#1F2937' }}>
                Gemini API Key
              </Text>
              <TouchableOpacity onPress={() => setShowApiKeyModal(false)}>
                <X size={24} color={isDark ? '#9CA3AF' : '#6B7280'} />
              </TouchableOpacity>
            </View>

            <Text className="mb-2" style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}>
              Enter your Gemini API key to enable AI-powered design generation.
            </Text>

            {hasApiKey() && (
              <Text className="mb-2 text-xs" style={{ color: '#10B981' }}>
                Current key: {apiKeyMasked}
              </Text>
            )}

            <TextInput
              className="rounded-lg px-4 py-3 mb-4"
              style={{
                backgroundColor: isDark ? '#2D2D2D' : '#F3F4F6',
                color: isDark ? '#FFFFFF' : '#1F2937',
              }}
              placeholder={hasApiKey() ? 'Enter new API key...' : 'AIza...'}
              placeholderTextColor="#9CA3AF"
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
                className="flex-1 py-3 rounded-lg items-center"
                style={{ backgroundColor: isDark ? '#2D2D2D' : '#F3F4F6' }}
                disabled={isSaving}
              >
                <Text style={{ color: isDark ? '#FFFFFF' : '#1F2937' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSaveApiKey}
                className="flex-1 py-3 rounded-lg items-center bg-primary-500"
                disabled={isSaving || !apiKeyInput.trim()}
                style={{ opacity: isSaving || !apiKeyInput.trim() ? 0.5 : 1 }}
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
                className="mt-3 py-2 items-center"
                disabled={isSaving}
              >
                <Text style={{ color: '#EF4444', fontSize: 14 }}>Remove API Key</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

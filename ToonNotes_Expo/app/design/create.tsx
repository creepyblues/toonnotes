/**
 * Design Creation Flow - Image-based customization
 *
 * Flow:
 * 1. Select an image
 * 2. Generate character sticker (background removal)
 * 3. Ask user which elements to apply (sticker, background, or both)
 * 4. Apply selected elements while keeping label preset design (fonts, colors, icons)
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image as RNImage,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  Image,
  Sparkle,
  User,
  ImageSquare,
  CheckCircle,
  Coin,
} from 'phosphor-react-native';
import * as ImagePicker from 'expo-image-picker';

import { useUserStore, useDesignStore, useNoteStore } from '@/stores';
import { FREE_DESIGN_QUOTA } from '@/stores/userStore';
import { NoteDesign } from '@/types';
import { generateStickerFromImage } from '@/services/geminiService';
import { useTheme } from '@/src/theme';
import { UpgradeModal } from '@/components/shop/UpgradeModal';
import {
  trackDesignFlowStarted,
  trackDesignGenerated,
  trackPaywallShown,
} from '@/utils/analytics';

type ApplyOption = 'sticker' | 'background' | 'both';

export default function CreateDesignScreen() {
  const router = useRouter();
  const { returnTo, noteId } = useLocalSearchParams<{ returnTo?: string; noteId?: string }>();
  const { getDesignCost, canAffordDesign, spendCoin, getFreeDesignsRemaining, user } = useUserStore();
  const { addDesign, getDesignById } = useDesignStore();
  const { getNoteById, updateNote } = useNoteStore();
  const { colors, isDark } = useTheme();

  // State
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [generatedStickerUri, setGeneratedStickerUri] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedOption, setSelectedOption] = useState<ApplyOption>('both');
  const [step, setStep] = useState<'select' | 'options'>('select');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const cost = getDesignCost();
  const canAfford = canAffordDesign();
  const freeRemaining = getFreeDesignsRemaining();

  // Track flow started on mount
  useEffect(() => {
    trackDesignFlowStarted(freeRemaining, user.coinBalance);
  }, []);

  // Get current note's design to preserve label preset elements
  const currentNote = noteId ? getNoteById(noteId) : null;
  const currentDesign = currentNote?.designId ? getDesignById(currentNote.designId) : null;

  // ============================================
  // Event Handlers
  // ============================================

  const handleSelectImage = async () => {
    if (!canAfford) {
      // Show upgrade modal instead of alert
      trackPaywallShown(freeRemaining, user.coinBalance);
      setShowUpgradeModal(true);
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please allow access to your photo library to select an image.'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const imageUri = result.assets[0].uri;
      setSelectedImage(imageUri);
      // Generate sticker immediately
      await generateSticker(imageUri);
    }
  };

  const generateSticker = async (imageUri: string) => {
    setIsGenerating(true);
    try {
      const stickerUri = await generateStickerFromImage(imageUri);
      setGeneratedStickerUri(stickerUri);
      setStep('options');
    } catch (error: any) {
      console.error('Sticker generation failed:', error);
      // Even if sticker generation fails, allow using image as background
      setStep('options');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplyDesign = async () => {
    if (!selectedImage) return;

    // Track whether we're using a free design
    const usingFreeDesign = freeRemaining > 0;

    // Create design based on selected options
    const design = createCustomDesign();

    // Save the design first, then deduct cost (prevents coin loss on failure)
    addDesign(design);
    spendCoin();

    // Track the design generation
    trackDesignGenerated(usingFreeDesign);

    // Navigate based on origin
    if (returnTo === 'note' && noteId) {
      updateNote(noteId, { designId: design.id });
      Alert.alert(
        'Design Applied!',
        getApplyMessage(),
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } else {
      Alert.alert(
        'Design Created!',
        getApplyMessage(),
        [{ text: 'OK', onPress: () => router.back() }]
      );
    }
  };

  const getApplyMessage = () => {
    switch (selectedOption) {
      case 'sticker':
        return 'Character sticker has been added to your note.';
      case 'background':
        return 'Background image has been applied to your note.';
      case 'both':
        return 'Sticker and background have been applied to your note.';
    }
  };

  const createCustomDesign = (): NoteDesign => {
    const now = Date.now();
    const id = `custom-${now}`;

    // Start with current design's properties or defaults
    const baseDesign = currentDesign || {
      background: {
        primaryColor: '#FFFFFF',
        style: 'solid' as const,
      },
      colors: {
        titleText: '#1F2937',
        bodyText: '#4B5563',
        accent: '#7C3AED',
      },
      typography: {
        titleStyle: 'sans-serif' as const,
        vibe: 'modern' as const,
      },
    };

    // Build design based on selected options
    const design: NoteDesign = {
      id,
      name: 'Custom Design',
      sourceImageUri: selectedImage!,
      createdAt: now,

      // Keep label preset colors
      colors: {
        titleText: baseDesign.colors.titleText,
        bodyText: baseDesign.colors.bodyText,
        accent: baseDesign.colors.accent,
      },

      // Keep label preset typography
      typography: {
        titleStyle: baseDesign.typography.titleStyle,
        vibe: baseDesign.typography.vibe,
      },

      // Background - only set image if selected
      background: selectedOption === 'background' || selectedOption === 'both'
        ? {
            primaryColor: baseDesign.background.primaryColor,
            style: 'image',
            imageUri: selectedImage!,
            opacity: 0.2,
          }
        : {
            ...baseDesign.background,
          },

      // Sticker - only set if selected and available
      sticker: (selectedOption === 'sticker' || selectedOption === 'both') && generatedStickerUri
        ? {
            id: `sticker-${now}`,
            imageUri: generatedStickerUri,
            description: 'Custom character sticker',
            suggestedPosition: 'bottom-right',
            scale: 'medium',
          }
        : currentDesign?.sticker || {
            id: '',
            imageUri: '',
            description: '',
            suggestedPosition: 'bottom-right',
            scale: 'medium',
          },

      designSummary: `Custom design with ${selectedOption === 'both' ? 'sticker and background' : selectedOption}`,

      // Preserve label preset reference if exists
      labelPresetId: currentDesign?.labelPresetId,
      isLabelPreset: false, // This is now a custom design
    };

    return design;
  };

  const handleBack = () => {
    if (step === 'options') {
      setStep('select');
      setSelectedImage(null);
      setGeneratedStickerUri(null);
    } else {
      router.back();
    }
  };

  // ============================================
  // Render
  // ============================================

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: colors.backgroundSecondary }}
      edges={['top', 'bottom']}
    >
      {/* Header */}
      <View
        className="flex-row items-center px-2 py-2 border-b"
        style={{ borderBottomColor: colors.separator }}
      >
        <TouchableOpacity onPress={handleBack} className="p-2" disabled={isGenerating}>
          <ArrowLeft size={24} color={isGenerating ? colors.textTertiary : colors.textPrimary} />
        </TouchableOpacity>
        <Text
          className="text-lg font-semibold ml-2"
          style={{ color: colors.textPrimary }}
        >
          {step === 'select' ? 'Add Custom Element' : 'Choose What to Apply'}
        </Text>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1 }}>
        {step === 'select' ? (
          // Step 1: Select Image
          <View className="flex-1 px-4 pt-8">
            {/* Instructions */}
            <View className="items-center mb-8">
              <Sparkle size={48} color={colors.accent} weight="duotone" />
              <Text
                className="text-xl font-bold mt-4 text-center"
                style={{ color: colors.textPrimary }}
              >
                Add Your Image
              </Text>
              <Text
                className="text-center mt-2 px-8"
                style={{ color: colors.textSecondary }}
              >
                Select an image to create a character sticker or use as background
              </Text>
            </View>

            {/* Image Selection */}
            {isGenerating ? (
              <View
                className="h-64 rounded-2xl items-center justify-center overflow-hidden"
                style={{ backgroundColor: colors.surfaceCard }}
              >
                {selectedImage && (
                  <RNImage
                    source={{ uri: selectedImage }}
                    style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0.3 }}
                    resizeMode="cover"
                  />
                )}
                <ActivityIndicator size="large" color={colors.accent} />
                <Text
                  className="mt-4 font-medium"
                  style={{ color: colors.textSecondary }}
                >
                  Creating sticker...
                </Text>
                <Text
                  className="text-sm mt-1"
                  style={{ color: colors.textTertiary }}
                >
                  Removing background from image
                </Text>
              </View>
            ) : (
              <TouchableOpacity
                onPress={handleSelectImage}
                className="h-64 rounded-2xl items-center justify-center border-2 border-dashed"
                style={{
                  backgroundColor: isDark ? `${colors.accent}15` : '#F5F3FF',
                  borderColor: colors.accent,
                }}
              >
                <Image size={56} color={colors.accent} weight="duotone" />
                <Text
                  className="mt-4 font-semibold text-lg"
                  style={{ color: colors.accent }}
                >
                  Tap to Select Image
                </Text>
              </TouchableOpacity>
            )}

            {/* Free designs remaining / Cost Indicator */}
            <View className="items-center mt-8">
              {freeRemaining > 0 ? (
                <>
                  <View
                    className="flex-row items-center px-5 py-3 rounded-full"
                    style={{ backgroundColor: isDark ? `${colors.accent}20` : '#F5F3FF' }}
                  >
                    <Sparkle size={20} color={colors.accent} />
                    <Text
                      className="font-semibold ml-2 text-base"
                      style={{ color: colors.accent }}
                    >
                      Free!
                    </Text>
                  </View>
                  <Text
                    className="text-sm mt-3"
                    style={{ color: colors.textSecondary }}
                  >
                    {freeRemaining} of {FREE_DESIGN_QUOTA} free designs remaining
                  </Text>
                </>
              ) : canAfford ? (
                <>
                  <View
                    className="flex-row items-center px-5 py-3 rounded-full"
                    style={{ backgroundColor: isDark ? `${colors.accent}20` : '#F5F3FF' }}
                  >
                    <Coin size={20} color={colors.accent} weight="duotone" />
                    <Text
                      className="font-semibold ml-2 text-base"
                      style={{ color: colors.accent }}
                    >
                      1 coin
                    </Text>
                  </View>
                  <Text
                    className="text-sm mt-3"
                    style={{ color: colors.textSecondary }}
                  >
                    You have {user.coinBalance} coins
                  </Text>
                </>
              ) : (
                <>
                  <View
                    className="flex-row items-center px-5 py-3 rounded-full"
                    style={{ backgroundColor: '#FEF2F2' }}
                  >
                    <Coin size={20} color="#EF4444" weight="duotone" />
                    <Text
                      className="font-semibold ml-2 text-base"
                      style={{ color: '#EF4444' }}
                    >
                      No coins
                    </Text>
                  </View>
                  <Text
                    className="text-sm mt-3"
                    style={{ color: '#EF4444' }}
                  >
                    Free designs used. Get coins to continue.
                  </Text>
                </>
              )}
            </View>
          </View>
        ) : (
          // Step 2: Choose Options
          <View className="flex-1 px-4 pt-6">
            {/* Preview Row */}
            <View className="flex-row mb-6">
              {/* Original Image */}
              <View className="flex-1 mr-2">
                <Text
                  className="text-xs mb-2 text-center"
                  style={{ color: colors.textSecondary }}
                >
                  Original
                </Text>
                <View
                  className="aspect-square rounded-xl overflow-hidden"
                  style={{ backgroundColor: colors.surfaceCard }}
                >
                  {selectedImage && (
                    <RNImage
                      source={{ uri: selectedImage }}
                      style={{ width: '100%', height: '100%' }}
                      resizeMode="cover"
                    />
                  )}
                </View>
              </View>

              {/* Sticker Preview */}
              <View className="flex-1 ml-2">
                <Text
                  className="text-xs mb-2 text-center"
                  style={{ color: colors.textSecondary }}
                >
                  Sticker
                </Text>
                <View
                  className="aspect-square rounded-xl overflow-hidden items-center justify-center"
                  style={{ backgroundColor: colors.surfaceCard }}
                >
                  {generatedStickerUri ? (
                    <RNImage
                      source={{ uri: generatedStickerUri }}
                      style={{ width: '100%', height: '100%' }}
                      resizeMode="contain"
                    />
                  ) : (
                    <Text
                      className="text-xs text-center px-2"
                      style={{ color: colors.textTertiary }}
                    >
                      Sticker unavailable
                    </Text>
                  )}
                </View>
              </View>
            </View>

            {/* Options */}
            <Text
              className="text-sm font-semibold mb-3"
              style={{ color: colors.textSecondary }}
            >
              What would you like to apply?
            </Text>

            {/* Option: Sticker Only */}
            <TouchableOpacity
              onPress={() => setSelectedOption('sticker')}
              disabled={!generatedStickerUri}
              className="flex-row items-center p-4 rounded-xl mb-3 border-2"
              style={{
                borderColor: selectedOption === 'sticker' ? colors.accent : colors.border,
                backgroundColor: selectedOption === 'sticker'
                  ? (isDark ? `${colors.accent}15` : '#F5F3FF')
                  : colors.surfaceCard,
                opacity: !generatedStickerUri ? 0.5 : 1,
              }}
            >
              <View
                className="w-10 h-10 rounded-full items-center justify-center"
                style={{
                  backgroundColor: selectedOption === 'sticker'
                    ? colors.accent
                    : (isDark ? colors.backgroundTertiary : '#F3F4F6'),
                }}
              >
                <User size={20} color={selectedOption === 'sticker' ? '#FFFFFF' : colors.textSecondary} />
              </View>
              <View className="flex-1 ml-3">
                <Text
                  className="font-semibold"
                  style={{ color: selectedOption === 'sticker' ? colors.accent : colors.textPrimary }}
                >
                  Character Sticker Only
                </Text>
                <Text
                  className="text-sm"
                  style={{ color: colors.textSecondary }}
                >
                  Add sticker to your note, keep current background
                </Text>
              </View>
              {selectedOption === 'sticker' && (
                <CheckCircle size={24} color={colors.accent} weight="fill" />
              )}
            </TouchableOpacity>

            {/* Option: Background Only */}
            <TouchableOpacity
              onPress={() => setSelectedOption('background')}
              className="flex-row items-center p-4 rounded-xl mb-3 border-2"
              style={{
                borderColor: selectedOption === 'background' ? colors.accent : colors.border,
                backgroundColor: selectedOption === 'background'
                  ? (isDark ? `${colors.accent}15` : '#F5F3FF')
                  : colors.surfaceCard,
              }}
            >
              <View
                className="w-10 h-10 rounded-full items-center justify-center"
                style={{
                  backgroundColor: selectedOption === 'background'
                    ? colors.accent
                    : (isDark ? colors.backgroundTertiary : '#F3F4F6'),
                }}
              >
                <ImageSquare size={20} color={selectedOption === 'background' ? '#FFFFFF' : colors.textSecondary} />
              </View>
              <View className="flex-1 ml-3">
                <Text
                  className="font-semibold"
                  style={{ color: selectedOption === 'background' ? colors.accent : colors.textPrimary }}
                >
                  Background Image Only
                </Text>
                <Text
                  className="text-sm"
                  style={{ color: colors.textSecondary }}
                >
                  Use image as background, keep current sticker
                </Text>
              </View>
              {selectedOption === 'background' && (
                <CheckCircle size={24} color={colors.accent} weight="fill" />
              )}
            </TouchableOpacity>

            {/* Option: Both */}
            <TouchableOpacity
              onPress={() => setSelectedOption('both')}
              disabled={!generatedStickerUri}
              className="flex-row items-center p-4 rounded-xl mb-3 border-2"
              style={{
                borderColor: selectedOption === 'both' ? colors.accent : colors.border,
                backgroundColor: selectedOption === 'both'
                  ? (isDark ? `${colors.accent}15` : '#F5F3FF')
                  : colors.surfaceCard,
                opacity: !generatedStickerUri ? 0.5 : 1,
              }}
            >
              <View
                className="w-10 h-10 rounded-full items-center justify-center"
                style={{
                  backgroundColor: selectedOption === 'both'
                    ? colors.accent
                    : (isDark ? colors.backgroundTertiary : '#F3F4F6'),
                }}
              >
                <Sparkle size={20} color={selectedOption === 'both' ? '#FFFFFF' : colors.textSecondary} />
              </View>
              <View className="flex-1 ml-3">
                <Text
                  className="font-semibold"
                  style={{ color: selectedOption === 'both' ? colors.accent : colors.textPrimary }}
                >
                  Both Sticker & Background
                </Text>
                <Text
                  className="text-sm"
                  style={{ color: colors.textSecondary }}
                >
                  Apply sticker and use image as background
                </Text>
              </View>
              {selectedOption === 'both' && (
                <CheckCircle size={24} color={colors.accent} weight="fill" />
              )}
            </TouchableOpacity>

            {/* Info about preserving design */}
            <View
              className="rounded-xl p-4 mt-2"
              style={{ backgroundColor: isDark ? colors.backgroundTertiary : '#F9FAFB' }}
            >
              <Text
                className="text-sm"
                style={{ color: colors.textSecondary }}
              >
                Your current design's fonts, colors, and icons will be preserved.
              </Text>
            </View>

            {/* Apply Button */}
            <TouchableOpacity
              onPress={handleApplyDesign}
              className="py-4 rounded-xl mt-6 items-center"
              style={{ backgroundColor: colors.accent }}
            >
              <Text className="font-semibold text-lg" style={{ color: '#FFFFFF' }}>
                Apply to Note
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Upgrade Modal (Soft Paywall) */}
      <UpgradeModal
        visible={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />
    </SafeAreaView>
  );
}

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
  Modal,
  StyleSheet,
} from 'react-native';
import { generateUUID } from '@/utils/uuid';
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
import { NoteDesign, QualityMetadata } from '@/types';
import { generateStickerFromImageWithQuality, StickerFromImageResult } from '@/services/geminiService';
import { useTheme } from '@/src/theme';
import { UpgradeModal } from '@/components/shop/UpgradeModal';
import { QualityPreview } from '@/components/designs/QualityPreview';
import { isLowQuality, DEFAULT_SUCCESS_QUALITY } from '@/utils/validation/apiResponse';
import { trackQualityDecision } from '@/services/qualityService';
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

  // Quality preview state
  const [showQualityPreview, setShowQualityPreview] = useState(false);
  const [previewData, setPreviewData] = useState<StickerFromImageResult | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

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
      const result = await generateStickerFromImageWithQuality(imageUri);

      if (result) {
        // Check if we should show quality preview
        if (isLowQuality(result.qualityMetadata)) {
          // Show preview modal for user to accept/retry
          setPreviewData(result);
          setShowQualityPreview(true);
        } else {
          // Quality is good, proceed directly
          setGeneratedStickerUri(result.uri);
          setStep('options');
        }
      } else {
        // Generation failed, allow using image as background
        setStep('options');
      }
    } catch (error: any) {
      console.error('Sticker generation failed:', error);
      // Even if sticker generation fails, allow using image as background
      setStep('options');
    } finally {
      setIsGenerating(false);
    }
  };

  // Quality preview handlers
  const handleAcceptQuality = () => {
    if (previewData) {
      setGeneratedStickerUri(previewData.uri);
      trackQualityDecision('accepted', 'sticker', previewData.qualityMetadata);
    }
    setShowQualityPreview(false);
    setPreviewData(null);
    setStep('options');
  };

  const handleRetryQuality = async () => {
    if (!selectedImage) return;

    setIsRetrying(true);
    trackQualityDecision('retry', 'sticker', previewData?.qualityMetadata);

    try {
      const result = await generateStickerFromImageWithQuality(selectedImage);

      if (result) {
        setPreviewData(result);
        // Don't auto-proceed on retry - always show preview
      }
    } catch (error) {
      console.error('Retry failed:', error);
    } finally {
      setIsRetrying(false);
    }
  };

  const handleCancelQuality = () => {
    trackQualityDecision('rejected', 'sticker', previewData?.qualityMetadata);
    setShowQualityPreview(false);
    setPreviewData(null);
    setSelectedImage(null);
    setStep('select');
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
    const id = generateUUID();

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
      style={{ flex: 1, backgroundColor: colors.backgroundSecondary }}
      edges={['top', 'bottom']}
    >
      {/* Header */}
      <View
        style={[styles.header, { borderBottomColor: colors.separator }]}
      >
        <TouchableOpacity onPress={handleBack} style={styles.backButton} disabled={isGenerating}>
          <ArrowLeft size={24} color={isGenerating ? colors.textTertiary : colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
          {step === 'select' ? 'Add Custom Element' : 'Choose What to Apply'}
        </Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent}>
        {step === 'select' ? (
          // Step 1: Select Image
          <View style={styles.stepContainer}>
            {/* Instructions */}
            <View style={styles.instructionsContainer}>
              <Sparkle size={48} color={colors.accent} weight="duotone" />
              <Text style={[styles.instructionsTitle, { color: colors.textPrimary }]}>
                Add Your Image
              </Text>
              <Text style={[styles.instructionsText, { color: colors.textSecondary }]}>
                Select an image to create a character sticker or use as background
              </Text>
            </View>

            {/* Image Selection */}
            {isGenerating ? (
              <View style={[styles.imageArea, { backgroundColor: colors.surfaceCard }]}>
                {selectedImage && (
                  <RNImage
                    source={{ uri: selectedImage }}
                    style={styles.imageOverlay}
                    resizeMode="cover"
                  />
                )}
                <ActivityIndicator size="large" color={colors.accent} />
                <Text style={[styles.generatingText, { color: colors.textSecondary }]}>
                  Creating sticker...
                </Text>
                <Text style={[styles.generatingSubtext, { color: colors.textTertiary }]}>
                  Removing background from image
                </Text>
              </View>
            ) : (
              <TouchableOpacity
                onPress={handleSelectImage}
                style={[
                  styles.imageAreaDashed,
                  {
                    backgroundColor: isDark ? `${colors.accent}15` : '#F5F3FF',
                    borderColor: colors.accent,
                    borderStyle: 'dashed',
                  },
                ]}
              >
                <Image size={56} color={colors.accent} weight="duotone" />
                <Text style={[styles.selectImageText, { color: colors.accent }]}>
                  Tap to Select Image
                </Text>
              </TouchableOpacity>
            )}

            {/* Free designs remaining / Cost Indicator */}
            <View style={styles.costContainer}>
              {freeRemaining > 0 ? (
                <>
                  <View style={[styles.costBadge, { backgroundColor: isDark ? `${colors.accent}20` : '#F5F3FF' }]}>
                    <Sparkle size={20} color={colors.accent} />
                    <Text style={[styles.costBadgeText, { color: colors.accent }]}>
                      Free!
                    </Text>
                  </View>
                  <Text style={[styles.costSubtext, { color: colors.textSecondary }]}>
                    {freeRemaining} of {FREE_DESIGN_QUOTA} free designs remaining
                  </Text>
                </>
              ) : canAfford ? (
                <>
                  <View style={[styles.costBadge, { backgroundColor: isDark ? `${colors.accent}20` : '#F5F3FF' }]}>
                    <Coin size={20} color={colors.accent} weight="duotone" />
                    <Text style={[styles.costBadgeText, { color: colors.accent }]}>
                      1 coin
                    </Text>
                  </View>
                  <Text style={[styles.costSubtext, { color: colors.textSecondary }]}>
                    You have {user.coinBalance} coins
                  </Text>
                </>
              ) : (
                <>
                  <View style={[styles.costBadge, { backgroundColor: '#FEF2F2' }]}>
                    <Coin size={20} color="#EF4444" weight="duotone" />
                    <Text style={[styles.costBadgeText, { color: '#EF4444' }]}>
                      No coins
                    </Text>
                  </View>
                  <Text style={[styles.costSubtext, { color: '#EF4444' }]}>
                    Free designs used. Get coins to continue.
                  </Text>
                </>
              )}
            </View>
          </View>
        ) : (
          // Step 2: Choose Options
          <View style={styles.stepContainerOptions}>
            {/* Preview Row */}
            <View style={styles.previewRow}>
              {/* Original Image */}
              <View style={styles.previewColumn}>
                <Text style={[styles.previewLabel, { color: colors.textSecondary }]}>
                  Original
                </Text>
                <View style={[styles.previewBox, { backgroundColor: colors.surfaceCard }]}>
                  {selectedImage && (
                    <RNImage
                      source={{ uri: selectedImage }}
                      style={styles.previewImage}
                      resizeMode="cover"
                    />
                  )}
                </View>
              </View>

              {/* Sticker Preview */}
              <View style={styles.previewColumnRight}>
                <Text style={[styles.previewLabel, { color: colors.textSecondary }]}>
                  Sticker
                </Text>
                <View style={[styles.previewBoxCentered, { backgroundColor: colors.surfaceCard }]}>
                  {generatedStickerUri ? (
                    <RNImage
                      source={{ uri: generatedStickerUri }}
                      style={styles.previewImage}
                      resizeMode="contain"
                    />
                  ) : (
                    <Text style={[styles.previewPlaceholderText, { color: colors.textTertiary }]}>
                      Sticker unavailable
                    </Text>
                  )}
                </View>
              </View>
            </View>

            {/* Options */}
            <Text style={[styles.optionsSectionTitle, { color: colors.textSecondary }]}>
              What would you like to apply?
            </Text>

            {/* Option: Sticker Only */}
            <TouchableOpacity
              onPress={() => setSelectedOption('sticker')}
              disabled={!generatedStickerUri}
              style={[
                styles.optionCard,
                {
                  borderColor: selectedOption === 'sticker' ? colors.accent : colors.border,
                  backgroundColor: selectedOption === 'sticker'
                    ? (isDark ? `${colors.accent}15` : '#F5F3FF')
                    : colors.surfaceCard,
                  opacity: !generatedStickerUri ? 0.5 : 1,
                },
              ]}
            >
              <View
                style={[
                  styles.optionIcon,
                  {
                    backgroundColor: selectedOption === 'sticker'
                      ? colors.accent
                      : (isDark ? colors.backgroundTertiary : '#F3F4F6'),
                  },
                ]}
              >
                <User size={20} color={selectedOption === 'sticker' ? '#FFFFFF' : colors.textSecondary} />
              </View>
              <View style={styles.optionContent}>
                <Text style={[styles.optionTitle, { color: selectedOption === 'sticker' ? colors.accent : colors.textPrimary }]}>
                  Character Sticker Only
                </Text>
                <Text style={[styles.optionDescription, { color: colors.textSecondary }]}>
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
              style={[
                styles.optionCard,
                {
                  borderColor: selectedOption === 'background' ? colors.accent : colors.border,
                  backgroundColor: selectedOption === 'background'
                    ? (isDark ? `${colors.accent}15` : '#F5F3FF')
                    : colors.surfaceCard,
                },
              ]}
            >
              <View
                style={[
                  styles.optionIcon,
                  {
                    backgroundColor: selectedOption === 'background'
                      ? colors.accent
                      : (isDark ? colors.backgroundTertiary : '#F3F4F6'),
                  },
                ]}
              >
                <ImageSquare size={20} color={selectedOption === 'background' ? '#FFFFFF' : colors.textSecondary} />
              </View>
              <View style={styles.optionContent}>
                <Text style={[styles.optionTitle, { color: selectedOption === 'background' ? colors.accent : colors.textPrimary }]}>
                  Background Image Only
                </Text>
                <Text style={[styles.optionDescription, { color: colors.textSecondary }]}>
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
              style={[
                styles.optionCard,
                {
                  borderColor: selectedOption === 'both' ? colors.accent : colors.border,
                  backgroundColor: selectedOption === 'both'
                    ? (isDark ? `${colors.accent}15` : '#F5F3FF')
                    : colors.surfaceCard,
                  opacity: !generatedStickerUri ? 0.5 : 1,
                },
              ]}
            >
              <View
                style={[
                  styles.optionIcon,
                  {
                    backgroundColor: selectedOption === 'both'
                      ? colors.accent
                      : (isDark ? colors.backgroundTertiary : '#F3F4F6'),
                  },
                ]}
              >
                <Sparkle size={20} color={selectedOption === 'both' ? '#FFFFFF' : colors.textSecondary} />
              </View>
              <View style={styles.optionContent}>
                <Text style={[styles.optionTitle, { color: selectedOption === 'both' ? colors.accent : colors.textPrimary }]}>
                  Both Sticker & Background
                </Text>
                <Text style={[styles.optionDescription, { color: colors.textSecondary }]}>
                  Apply sticker and use image as background
                </Text>
              </View>
              {selectedOption === 'both' && (
                <CheckCircle size={24} color={colors.accent} weight="fill" />
              )}
            </TouchableOpacity>

            {/* Info about preserving design */}
            <View style={[styles.infoBox, { backgroundColor: isDark ? colors.backgroundTertiary : '#F9FAFB' }]}>
              <Text style={[styles.infoBoxText, { color: colors.textSecondary }]}>
                Your current design's fonts, colors, and icons will be preserved.
              </Text>
            </View>

            {/* Apply Button */}
            <TouchableOpacity
              onPress={handleApplyDesign}
              style={[styles.applyButton, { backgroundColor: colors.accent }]}
            >
              <Text style={[styles.applyButtonText, { color: '#FFFFFF' }]}>
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

      {/* Quality Preview Modal */}
      <Modal
        visible={showQualityPreview}
        transparent
        animationType="fade"
        onRequestClose={handleCancelQuality}
      >
        <View style={styles.modalOverlay}>
          <QualityPreview
            imageUri={previewData?.uri || ''}
            qualityMetadata={previewData?.qualityMetadata || DEFAULT_SUCCESS_QUALITY}
            onAccept={handleAcceptQuality}
            onRetry={handleRetryQuality}
            onCancel={handleCancelQuality}
            isRetrying={isRetrying}
            title="Sticker Preview"
          />
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },

  // Container layouts
  scrollContent: { flexGrow: 1 },
  stepContainer: { flex: 1, paddingHorizontal: 16, paddingTop: 32 },
  stepContainerOptions: { flex: 1, paddingHorizontal: 16, paddingTop: 24 },

  // Instructions section
  instructionsContainer: { alignItems: 'center', marginBottom: 32 },
  instructionsTitle: { fontSize: 20, fontWeight: '700', marginTop: 16, textAlign: 'center' },
  instructionsText: { textAlign: 'center', marginTop: 8, paddingHorizontal: 32 },

  // Image selection area
  imageArea: { height: 256, borderRadius: 16, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  imageAreaDashed: { height: 256, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 2 },
  imageOverlay: { position: 'absolute', width: '100%', height: '100%', opacity: 0.3 },
  generatingText: { marginTop: 16, fontWeight: '500' },
  generatingSubtext: { fontSize: 14, marginTop: 4 },
  selectImageText: { marginTop: 16, fontWeight: '600', fontSize: 18 },

  // Cost indicator
  costContainer: { alignItems: 'center', marginTop: 32 },
  costBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 999 },
  costBadgeText: { fontWeight: '600', marginLeft: 8, fontSize: 16 },
  costSubtext: { fontSize: 14, marginTop: 12 },

  // Preview row
  previewRow: { flexDirection: 'row', marginBottom: 24 },
  previewColumn: { flex: 1, marginRight: 8 },
  previewColumnRight: { flex: 1, marginLeft: 8 },
  previewLabel: { fontSize: 12, marginBottom: 8, textAlign: 'center' },
  previewBox: { aspectRatio: 1, borderRadius: 12, overflow: 'hidden' },
  previewBoxCentered: { aspectRatio: 1, borderRadius: 12, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  previewImage: { width: '100%', height: '100%' },
  previewPlaceholderText: { fontSize: 12, textAlign: 'center', paddingHorizontal: 8 },

  // Options section
  optionsSectionTitle: { fontSize: 14, fontWeight: '600', marginBottom: 12 },
  optionCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 2 },
  optionIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  optionContent: { flex: 1, marginLeft: 12 },
  optionTitle: { fontWeight: '600' },
  optionDescription: { fontSize: 14 },

  // Info box & Apply button
  infoBox: { borderRadius: 12, padding: 16, marginTop: 8 },
  infoBoxText: { fontSize: 14 },
  applyButton: { paddingVertical: 16, borderRadius: 12, marginTop: 24, alignItems: 'center' },
  applyButtonText: { fontWeight: '600', fontSize: 18 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center' },
});

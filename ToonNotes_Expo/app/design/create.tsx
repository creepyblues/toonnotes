/**
 * Design Creation Flow - Theme-First Approach
 *
 * New flow:
 * 1. Choose a theme (style-first)
 * 2. Optionally upload an image for AI color matching
 * 3. Preview the design live
 * 4. Generate and save
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image as RNImage,
  ActivityIndicator,
  Alert,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  Image,
  Sparkles,
  X,
  Check,
  Dice6,
  ChevronRight,
  Palette,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';

import { useUserStore, useDesignStore, useNoteStore } from '@/stores';
import { NoteColor } from '@/types';
import { generateDesign, generateLuckyDesign, generateThemedDesign } from '@/services/geminiService';
import { ThemePicker, CompactThemePicker } from '@/components/ThemePicker';
import { AccentLayer } from '@/components/AccentLayer';
import { BackgroundLayer } from '@/components/BackgroundLayer';
import { DesignTheme, ThemeId } from '@/types';
import { THEME_LIST, getThemeById, getRandomTheme } from '@/constants/themes';
import { composeThemeStyle, getThemeAccents } from '@/services/designEngine';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type CreationStep = 'theme' | 'image' | 'preview';

export default function CreateDesignScreen() {
  const router = useRouter();
  const { returnTo, noteId } = useLocalSearchParams<{ returnTo?: string; noteId?: string }>();
  const { user, getDesignCost, canAffordDesign, spendCoin } = useUserStore();
  const { addDesign } = useDesignStore();
  const { addNote, updateNote } = useNoteStore();

  // Flow state
  const [step, setStep] = useState<CreationStep>('theme');
  const [selectedTheme, setSelectedTheme] = useState<DesignTheme | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const cost = getDesignCost();
  const canAfford = canAffordDesign();

  // Compose preview style
  const previewStyle = useMemo(() => {
    if (!selectedTheme) return null;
    return composeThemeStyle(selectedTheme, 'detail');
  }, [selectedTheme]);

  const accentConfig = useMemo(() => {
    if (!selectedTheme) return null;
    return getThemeAccents(selectedTheme, 'detail');
  }, [selectedTheme]);

  // ============================================
  // Event Handlers
  // ============================================

  const handleSelectTheme = (theme: DesignTheme) => {
    setSelectedTheme(theme);
  };

  const handleSurpriseMe = () => {
    const randomTheme = getRandomTheme();
    setSelectedTheme(randomTheme);
  };

  const handleContinueToImage = () => {
    if (selectedTheme) {
      setStep('image');
    }
  };

  const handleSelectImage = async () => {
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
      setSelectedImage(result.assets[0].uri);
      setStep('preview');
    }
  };

  const handleClearImage = () => {
    setSelectedImage(null);
  };

  // Helper to navigate after design creation based on origin
  const navigateAfterCreation = (designId: string, designName: string) => {
    if (returnTo === 'note' && noteId) {
      // Came from note editor - apply design to note and go back
      updateNote(noteId, { designId });
      Alert.alert(
        'Design Applied!',
        `"${designName}" has been applied to your note.`,
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } else {
      // Came from My Designs or unknown - create new note with design
      const newNote = addNote({
        title: '',
        content: '',
        color: NoteColor.White,
        labels: [],
        isPinned: false,
        isArchived: false,
        isDeleted: false,
        designId,
      });
      Alert.alert(
        'Design Created!',
        `"${designName}" has been saved. Opening a new note with this design.`,
        [{ text: 'OK', onPress: () => router.replace(`/note/${newNote.id}`) }]
      );
    }
  };

  const handleGenerateDesign = async () => {
    if (!selectedTheme || !canAfford) return;

    setIsGenerating(true);

    try {
      // Deduct cost first
      spendCoin();

      // Generate design with theme
      const design = await generateThemedDesign(
        selectedTheme,
        selectedImage || undefined
      );

      // Save the design
      addDesign(design);

      // Navigate based on origin
      navigateAfterCreation(design.id, design.name);
    } catch (error: any) {
      console.error('Design generation failed:', error);
      Alert.alert(
        'Generation Failed',
        error.message || 'Failed to generate design. Please try again.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFeelingLucky = async () => {
    if (!canAfford) return;

    setIsGenerating(true);

    try {
      spendCoin();

      // Random theme + chaotic sticker
      const randomTheme = getRandomTheme();
      const design = await generateLuckyDesign(
        selectedImage || '',
        randomTheme
      );

      addDesign(design);

      // Navigate based on origin
      navigateAfterCreation(design.id, design.name);
    } catch (error: any) {
      console.error('Lucky design generation failed:', error);
      Alert.alert(
        'Generation Failed',
        error.message || 'The chaos was too much. Please try again.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleBack = () => {
    if (step === 'image') {
      setStep('theme');
    } else if (step === 'preview') {
      setStep('image');
    } else {
      router.back();
    }
  };

  // ============================================
  // Render Functions
  // ============================================

  const renderThemeStep = () => (
    <View className="flex-1">
      <ThemePicker
        selectedTheme={selectedTheme?.id || null}
        onSelectTheme={handleSelectTheme}
        onSurpriseMe={handleSurpriseMe}
        isDark={false}
      />

      {/* Continue Button */}
      {selectedTheme && (
        <View className="px-4 py-4 border-t border-gray-100 bg-white">
          <TouchableOpacity
            onPress={handleContinueToImage}
            className="flex-row items-center justify-center bg-sky-500 py-4 rounded-xl"
          >
            <Text className="text-white font-semibold text-lg">
              Continue with {selectedTheme.emoji} {selectedTheme.name}
            </Text>
            <ChevronRight size={20} color="#FFFFFF" className="ml-2" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderImageStep = () => (
    <View className="flex-1 px-6 justify-center items-center">
      {/* Theme indicator */}
      <View className="flex-row items-center px-4 py-2 rounded-full bg-gray-100 mb-8">
        <Text style={{ fontSize: 20 }}>{selectedTheme?.emoji}</Text>
        <Text className="text-gray-700 font-medium ml-2">
          {selectedTheme?.name}
        </Text>
      </View>

      {selectedImage ? (
        <View className="items-center">
          <View className="relative mb-6">
            <RNImage
              source={{ uri: selectedImage }}
              className="w-48 h-48 rounded-2xl"
              resizeMode="cover"
            />
            <TouchableOpacity
              onPress={handleClearImage}
              className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full items-center justify-center"
            >
              <X size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <Text className="text-lg font-semibold text-gray-900 mb-2">
            Image Selected
          </Text>
          <Text className="text-gray-500 text-center mb-6">
            AI will extract colors to customize your theme
          </Text>
        </View>
      ) : (
        <>
          <TouchableOpacity
            onPress={handleSelectImage}
            className="w-40 h-40 bg-gray-100 rounded-2xl items-center justify-center mb-6 border-2 border-dashed border-gray-300"
          >
            <Image size={48} color="#9CA3AF" />
            <Text className="text-gray-500 mt-2">Add Image</Text>
          </TouchableOpacity>

          <Text className="text-lg font-semibold text-gray-900 mb-2 text-center">
            Add Your Reference Image
          </Text>
          <Text className="text-gray-500 text-center mb-8 px-4">
            Upload anime art, webtoon panel, or any image to personalize colors
          </Text>
        </>
      )}

      {/* Action Button */}
      <View className="w-full">
        <TouchableOpacity
          onPress={() => setStep('preview')}
          className="bg-sky-500 py-4 rounded-xl items-center"
        >
          <Text className="text-white font-semibold text-lg">
            Continue to Preview
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderPreviewStep = () => (
    <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1 }}>
      {/* Theme Switcher */}
      <View className="py-4">
        <Text className="text-sm text-gray-500 font-medium mb-2 px-4">
          SELECTED THEME
        </Text>
        <CompactThemePicker
          selectedTheme={selectedTheme?.id || null}
          onSelectTheme={handleSelectTheme}
          isDark={false}
        />
      </View>

      {/* Live Preview */}
      <View className="px-4 mb-6">
        <Text className="text-sm text-gray-500 font-medium mb-3">PREVIEW</Text>
        <View
          className="rounded-2xl overflow-hidden"
          style={{
            height: 280,
            backgroundColor: previewStyle?.backgroundColor || '#FFFFFF',
            borderWidth: previewStyle?.borderWidth || 0,
            borderColor: previewStyle?.borderColor || '#000',
            borderRadius: previewStyle?.borderRadius || 16,
            shadowColor: previewStyle?.shadowColor || '#000',
            shadowOffset: previewStyle?.shadowOffset || { width: 0, height: 2 },
            shadowOpacity: previewStyle?.shadowOpacity || 0.1,
            shadowRadius: previewStyle?.shadowRadius || 4,
            elevation: previewStyle?.elevation || 2,
          }}
        >
          {/* Background Layer */}
          {previewStyle && (
            <BackgroundLayer
              style={previewStyle}
              context="detail"
            >
              <View className="flex-1 p-4">
                {/* Sample Content */}
                <Text
                  style={{
                    color: previewStyle.titleColor,
                    fontSize: 20,
                    fontWeight: '600',
                    marginBottom: 8,
                  }}
                >
                  Sample Note Title
                </Text>
                <Text
                  style={{
                    color: previewStyle.bodyColor,
                    fontSize: 14,
                    lineHeight: 20,
                  }}
                >
                  This is how your notes will look with the {selectedTheme?.name} theme. The colors, borders, and decorations are all customized to match this aesthetic.
                </Text>

                {/* Source Image Indicator */}
                {selectedImage && (
                  <View className="absolute bottom-4 left-4 flex-row items-center px-3 py-1.5 rounded-full bg-black/30">
                    <Palette size={14} color="#FFFFFF" />
                    <Text className="text-white text-xs ml-1.5">
                      Colors from your image
                    </Text>
                  </View>
                )}

                {/* Sticker Placeholder */}
                <View
                  className="absolute bottom-4 right-4 w-16 h-16 rounded-xl items-center justify-center"
                  style={{
                    backgroundColor: previewStyle.accentColor + '40',
                    borderWidth: 2,
                    borderColor: previewStyle.accentColor,
                    borderStyle: 'dashed',
                  }}
                >
                  <Sparkles size={24} color={previewStyle.accentColor} />
                </View>
              </View>

              {/* Accent Layer */}
              {accentConfig && (
                <AccentLayer
                  accentType={accentConfig.type}
                  color={accentConfig.color}
                  positions={accentConfig.positions}
                  animated={false}
                />
              )}
            </BackgroundLayer>
          )}
        </View>
      </View>

      {/* Cost Indicator */}
      <View className="items-center mb-6">
        <View className="flex-row items-center bg-sky-50 px-4 py-2 rounded-full">
          <Sparkles size={18} color="#0ea5e9" />
          <Text className="text-sky-600 font-semibold ml-2">
            {cost === 0 ? 'Free!' : `${cost} coin`}
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View className="px-4 pb-8">
        <TouchableOpacity
          onPress={handleGenerateDesign}
          disabled={!canAfford || isGenerating}
          className={`flex-row items-center justify-center py-4 rounded-xl mb-3 ${
            canAfford && !isGenerating ? 'bg-sky-500' : 'bg-gray-300'
          }`}
        >
          {isGenerating ? (
            <>
              <ActivityIndicator color="#FFFFFF" size="small" />
              <Text className="text-white font-semibold text-lg ml-2">
                Creating Design...
              </Text>
            </>
          ) : (
            <>
              <Check size={20} color="#FFFFFF" />
              <Text className="text-white font-semibold text-lg ml-2">
                Create Design
              </Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleFeelingLucky}
          disabled={!canAfford || isGenerating}
          className={`flex-row items-center justify-center py-4 rounded-xl ${
            canAfford && !isGenerating ? 'bg-amber-500' : 'bg-gray-300'
          }`}
        >
          <Dice6 size={20} color="#FFFFFF" />
          <Text className="text-white font-semibold text-lg ml-2">
            Feeling Lucky
          </Text>
        </TouchableOpacity>

        <Text className="text-gray-400 text-xs text-center mt-3">
          "Feeling Lucky" generates a wild, quirky design with transformed sticker!
        </Text>

        {!canAfford && (
          <Text className="text-red-500 text-sm text-center mt-4">
            Not enough coins. Purchase more in Settings.
          </Text>
        )}
      </View>
    </ScrollView>
  );

  // ============================================
  // Main Render
  // ============================================

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
      {/* Header */}
      <View className="flex-row items-center px-2 py-2 border-b border-gray-100">
        <TouchableOpacity onPress={handleBack} className="p-2">
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-gray-900 ml-2">
          {step === 'theme'
            ? 'Choose Style'
            : step === 'image'
            ? 'Add Reference'
            : 'Preview Design'}
        </Text>

        {/* Step Indicator */}
        <View className="flex-1 flex-row justify-end items-center pr-2">
          {['theme', 'image', 'preview'].map((s, i) => (
            <View
              key={s}
              className={`w-2 h-2 rounded-full mx-1 ${
                step === s
                  ? 'bg-sky-500'
                  : i < ['theme', 'image', 'preview'].indexOf(step)
                  ? 'bg-sky-300'
                  : 'bg-gray-200'
              }`}
            />
          ))}
        </View>
      </View>

      {/* Content */}
      {step === 'theme' && renderThemeStep()}
      {step === 'image' && renderImageStep()}
      {step === 'preview' && renderPreviewStep()}
    </SafeAreaView>
  );
}

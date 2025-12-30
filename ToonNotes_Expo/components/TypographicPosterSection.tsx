import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {
  TextAnalysis,
  TypographyPosterStyle,
  CharacterMascotType,
  TypographyImageResponse,
  CharacterMascotResponse,
} from '@/types';
import {
  TYPOGRAPHY_STYLES,
  CHARACTER_TYPES,
  generateTypographyPoster,
  generateCharacterMascot,
  saveTypographyPoster,
  saveCharacterMascot,
} from '@/services/geminiService';
import { useUserStore } from '@/stores';

interface TypographicPosterSectionProps {
  analysis: TextAnalysis;
  noteTitle: string;
  noteContent: string;
  noteId: string;
  isDark: boolean;
  onTypographyGenerated: (uri: string, response: TypographyImageResponse) => void;
  onCharacterGenerated: (uri: string, response: CharacterMascotResponse) => void;
}

export default function TypographicPosterSection({
  analysis,
  noteTitle,
  noteContent,
  noteId,
  isDark,
  onTypographyGenerated,
  onCharacterGenerated,
}: TypographicPosterSectionProps) {
  // Typography state
  const [selectedTypographyStyle, setSelectedTypographyStyle] = useState<TypographyPosterStyle>('hand-lettered');
  const [isGeneratingTypography, setIsGeneratingTypography] = useState(false);
  const [typographyResult, setTypographyResult] = useState<{
    imageUri: string;
    response: TypographyImageResponse;
  } | null>(null);

  // Character state
  const [selectedCharacterType, setSelectedCharacterType] = useState<CharacterMascotType>('chibi-anime');
  const [isGeneratingCharacter, setIsGeneratingCharacter] = useState(false);
  const [characterResult, setCharacterResult] = useState<{
    imageUri: string;
    response: CharacterMascotResponse;
  } | null>(null);

  // Economy
  const { canAffordDesign, spendCoin } = useUserStore();

  const handleGenerateTypography = async () => {
    if (!canAffordDesign()) {
      Alert.alert(
        'Insufficient Coins',
        'You need coins to generate typography art. Visit the shop to get more coins.'
      );
      return;
    }

    setIsGeneratingTypography(true);
    try {
      // Spend coin first
      spendCoin();

      // Generate typography
      const response = await generateTypographyPoster(
        analysis,
        selectedTypographyStyle,
        noteTitle,
        noteContent
      );

      // Save to local storage
      const imageUri = await saveTypographyPoster(response);

      setTypographyResult({ imageUri, response });
      onTypographyGenerated(imageUri, response);
    } catch (error: any) {
      console.error('Typography generation error:', error);
      Alert.alert(
        'Generation Failed',
        error.message || 'Failed to generate typography. Please try again.'
      );
    } finally {
      setIsGeneratingTypography(false);
    }
  };

  const handleGenerateCharacter = async () => {
    if (!canAffordDesign()) {
      Alert.alert(
        'Insufficient Coins',
        'You need coins to generate a character mascot. Visit the shop to get more coins.'
      );
      return;
    }

    setIsGeneratingCharacter(true);
    try {
      // Spend coin first
      spendCoin();

      // Generate character
      const response = await generateCharacterMascot(
        analysis,
        selectedCharacterType,
        noteTitle,
        noteContent
      );

      // Save to local storage
      const imageUri = await saveCharacterMascot(response);

      setCharacterResult({ imageUri, response });
      onCharacterGenerated(imageUri, response);
    } catch (error: any) {
      console.error('Character generation error:', error);
      Alert.alert(
        'Generation Failed',
        error.message || 'Failed to generate character. Please try again.'
      );
    } finally {
      setIsGeneratingCharacter(false);
    }
  };

  return (
    <View
      style={{
        borderTopWidth: 1,
        borderTopColor: isDark ? '#374151' : '#E5E7EB',
        paddingTop: 16,
        marginTop: 16,
      }}
    >
      {/* Section Header */}
      <Text
        style={{
          fontSize: 14,
          fontWeight: '600',
          color: '#8B5CF6',
          marginBottom: 4,
        }}
      >
        ✍️ Typographic Poster
      </Text>
      <Text
        style={{
          fontSize: 12,
          color: isDark ? '#9CA3AF' : '#6B7280',
          marginBottom: 16,
        }}
      >
        Generate stylized text art and character mascot from your note
      </Text>

      {/* Typography Subsection */}
      <View style={{ marginBottom: 20 }}>
        <Text
          style={{
            fontSize: 13,
            fontWeight: '500',
            color: isDark ? '#E5E7EB' : '#374151',
            marginBottom: 8,
          }}
        >
          Typography Style
        </Text>

        {/* Style Selector */}
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
          {TYPOGRAPHY_STYLES.map((styleOption) => (
            <TouchableOpacity
              key={styleOption.id}
              onPress={() => setSelectedTypographyStyle(styleOption.id)}
              style={{
                flex: 1,
                paddingVertical: 10,
                paddingHorizontal: 6,
                borderRadius: 12,
                backgroundColor:
                  selectedTypographyStyle === styleOption.id
                    ? '#8B5CF6'
                    : isDark
                    ? '#2D2D2D'
                    : '#F3F4F6',
                borderWidth: 2,
                borderColor:
                  selectedTypographyStyle === styleOption.id
                    ? '#8B5CF6'
                    : 'transparent',
                alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: 18, marginBottom: 2 }}>
                {styleOption.emoji}
              </Text>
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: '600',
                  color:
                    selectedTypographyStyle === styleOption.id
                      ? '#FFFFFF'
                      : isDark
                      ? '#E5E7EB'
                      : '#374151',
                  textAlign: 'center',
                }}
                numberOfLines={1}
              >
                {styleOption.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Generate Typography Button */}
        <TouchableOpacity
          onPress={handleGenerateTypography}
          disabled={isGeneratingTypography}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 10,
            borderRadius: 10,
            backgroundColor: '#8B5CF6',
            opacity: isGeneratingTypography ? 0.7 : 1,
          }}
        >
          {isGeneratingTypography ? (
            <>
              <ActivityIndicator color="#FFFFFF" size="small" />
              <Text
                style={{ marginLeft: 8, color: '#FFFFFF', fontWeight: '600' }}
              >
                Creating typography...
              </Text>
            </>
          ) : (
            <>
              <Text style={{ marginRight: 6, fontSize: 14 }}>✍️</Text>
              <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>
                Generate Typography (1 coin)
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* Typography Preview */}
        {typographyResult && (
          <View style={{ marginTop: 12 }}>
            <View
              style={{
                backgroundColor: isDark ? '#2D2D2D' : '#F3F4F6',
                borderRadius: 12,
                overflow: 'hidden',
              }}
            >
              <Image
                source={{ uri: typographyResult.imageUri }}
                style={{
                  width: '100%',
                  height: 180,
                }}
                resizeMode="contain"
              />
            </View>
            <Text
              style={{
                fontSize: 11,
                color: isDark ? '#9CA3AF' : '#6B7280',
                marginTop: 8,
                fontStyle: 'italic',
              }}
            >
              "{typographyResult.response.renderedText}"
            </Text>
            {typographyResult.response.artistNotes && (
              <Text
                style={{
                  fontSize: 10,
                  color: isDark ? '#6B7280' : '#9CA3AF',
                  marginTop: 4,
                }}
              >
                {typographyResult.response.artistNotes}
              </Text>
            )}
          </View>
        )}
      </View>

      {/* Character Mascot Subsection */}
      <View>
        <Text
          style={{
            fontSize: 13,
            fontWeight: '500',
            color: isDark ? '#E5E7EB' : '#374151',
            marginBottom: 8,
          }}
        >
          Character Mascot
        </Text>

        {/* Character Type Selector */}
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
          {CHARACTER_TYPES.map((charOption) => (
            <TouchableOpacity
              key={charOption.id}
              onPress={() => setSelectedCharacterType(charOption.id)}
              style={{
                flex: 1,
                paddingVertical: 10,
                paddingHorizontal: 6,
                borderRadius: 12,
                backgroundColor:
                  selectedCharacterType === charOption.id
                    ? '#F472B6'
                    : isDark
                    ? '#2D2D2D'
                    : '#F3F4F6',
                borderWidth: 2,
                borderColor:
                  selectedCharacterType === charOption.id
                    ? '#F472B6'
                    : 'transparent',
                alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: 18, marginBottom: 2 }}>
                {charOption.emoji}
              </Text>
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: '600',
                  color:
                    selectedCharacterType === charOption.id
                      ? '#FFFFFF'
                      : isDark
                      ? '#E5E7EB'
                      : '#374151',
                  textAlign: 'center',
                }}
                numberOfLines={1}
              >
                {charOption.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Generate Character Button */}
        <TouchableOpacity
          onPress={handleGenerateCharacter}
          disabled={isGeneratingCharacter}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 10,
            borderRadius: 10,
            backgroundColor: '#F472B6',
            opacity: isGeneratingCharacter ? 0.7 : 1,
          }}
        >
          {isGeneratingCharacter ? (
            <>
              <ActivityIndicator color="#FFFFFF" size="small" />
              <Text
                style={{ marginLeft: 8, color: '#FFFFFF', fontWeight: '600' }}
              >
                Creating character...
              </Text>
            </>
          ) : (
            <>
              <Text style={{ marginRight: 6, fontSize: 14 }}>🧸</Text>
              <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>
                Generate Character (1 coin)
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* Character Preview */}
        {characterResult && (
          <View style={{ marginTop: 12 }}>
            <View
              style={{
                backgroundColor: isDark ? '#2D2D2D' : '#F3F4F6',
                borderRadius: 12,
                overflow: 'hidden',
              }}
            >
              <Image
                source={{ uri: characterResult.imageUri }}
                style={{
                  width: '100%',
                  height: 180,
                }}
                resizeMode="contain"
              />
            </View>
            <Text
              style={{
                fontSize: 11,
                color: isDark ? '#9CA3AF' : '#6B7280',
                marginTop: 8,
                fontStyle: 'italic',
              }}
            >
              {characterResult.response.poseDescription}
            </Text>
            {characterResult.response.artistNotes && (
              <Text
                style={{
                  fontSize: 10,
                  color: isDark ? '#6B7280' : '#9CA3AF',
                  marginTop: 4,
                }}
              >
                {characterResult.response.artistNotes}
              </Text>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

/**
 * Board Design Creation Screen
 *
 * Allows users to generate AI-powered designs for their boards
 * using the board hashtag and note content as inspiration.
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Sparkles, Hash, FileText, Palette } from 'lucide-react-native';

import {
  useNoteStore,
  useUserStore,
  useBoardStore,
  useBoardDesignStore,
} from '@/stores';
import { generateBoardDesign } from '@/services/geminiService';
import { BoardDesign } from '@/types';
import { BoardCardPreview } from '@/components/boards/BoardCardPreview';

export default function CreateBoardDesignScreen() {
  const router = useRouter();
  const { hashtag } = useLocalSearchParams<{ hashtag: string }>();
  const { getNotesByLabel } = useNoteStore();
  const { applyDesign } = useBoardStore();
  const { addDesign } = useBoardDesignStore();
  const { settings } = useUserStore();
  const isDark = settings.darkMode;

  const [userHint, setUserHint] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState('');
  const [previewDesign, setPreviewDesign] = useState<BoardDesign | null>(null);

  const decodedHashtag = decodeURIComponent(hashtag || '');
  const notes = useMemo(
    () => getNotesByLabel(decodedHashtag),
    [decodedHashtag, getNotesByLabel]
  );

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGenerationProgress('Analyzing board content...');

    try {
      setGenerationProgress('Generating design...');
      const design = await generateBoardDesign(
        decodedHashtag,
        notes,
        userHint || undefined
      );
      setPreviewDesign(design);
      setGenerationProgress('');
    } catch (error: any) {
      console.error('Board design generation failed:', error);
      Alert.alert(
        'Generation Failed',
        error.message || 'Could not generate board design. Please try again.'
      );
      setGenerationProgress('');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApply = () => {
    if (!previewDesign) return;

    // Save design to store
    addDesign(previewDesign);

    // Link design to board
    applyDesign(decodedHashtag, previewDesign.id);

    Alert.alert(
      'Design Applied!',
      `"${previewDesign.name}" has been applied to your board.`,
      [{ text: 'OK', onPress: () => router.back() }]
    );
  };

  const handleRegenerate = () => {
    setPreviewDesign(null);
    handleGenerate();
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: isDark ? '#121212' : '#F5F0EB' },
      ]}
      edges={['top']}
    >
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: isDark ? '#121212' : '#F5F0EB',
            borderBottomColor: isDark ? '#2D2D2D' : '#E5DDD5',
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color={isDark ? '#FFFFFF' : '#1F2937'} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Palette size={20} color={isDark ? '#A78BFA' : '#7C3AED'} />
          <Text
            style={[styles.headerTitle, { color: isDark ? '#FFFFFF' : '#1F2937' }]}
          >
            Design Board
          </Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Board Info */}
        <View
          style={[
            styles.infoCard,
            { backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF' },
          ]}
        >
          <View style={styles.infoRow}>
            <Hash size={18} color={isDark ? '#A78BFA' : '#7C3AED'} />
            <Text
              style={[
                styles.hashtagText,
                { color: isDark ? '#FFFFFF' : '#1F2937' },
              ]}
            >
              {decodedHashtag}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <FileText size={16} color={isDark ? '#9CA3AF' : '#6B7280'} />
            <Text
              style={[styles.infoLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}
            >
              {notes.length} {notes.length === 1 ? 'note' : 'notes'} for inspiration
            </Text>
          </View>
        </View>

        {/* User Hint Input */}
        <View style={styles.section}>
          <Text
            style={[
              styles.sectionTitle,
              { color: isDark ? '#FFFFFF' : '#1F2937' },
            ]}
          >
            Design Style (Optional)
          </Text>
          <Text
            style={[
              styles.sectionDescription,
              { color: isDark ? '#9CA3AF' : '#6B7280' },
            ]}
          >
            Describe your ideal board aesthetic
          </Text>
          <TextInput
            style={[
              styles.textInput,
              {
                backgroundColor: isDark ? '#2D2D2D' : '#F9F9F9',
                color: isDark ? '#FFFFFF' : '#1F2937',
                borderColor: isDark ? '#404040' : '#E5E7EB',
              },
            ]}
            placeholder="e.g., cozy anime vibes, dark fantasy theme, pastel kawaii..."
            placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
            value={userHint}
            onChangeText={setUserHint}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* Preview or Generate Button */}
        {previewDesign ? (
          <View style={styles.section}>
            <Text
              style={[
                styles.sectionTitle,
                { color: isDark ? '#FFFFFF' : '#1F2937' },
              ]}
            >
              Preview
            </Text>
            <BoardCardPreview
              hashtag={decodedHashtag}
              noteCount={notes.length}
              previewNotes={notes.slice(0, 6)}
              boardDesign={previewDesign}
              isDark={isDark}
            />

            {/* Design Summary */}
            <View
              style={[
                styles.summaryCard,
                { backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF' },
              ]}
            >
              <Text
                style={[
                  styles.summaryTitle,
                  { color: isDark ? '#A78BFA' : '#7C3AED' },
                ]}
              >
                {previewDesign.name}
              </Text>
              <Text
                style={[
                  styles.summaryText,
                  { color: isDark ? '#D1D5DB' : '#4B5563' },
                ]}
              >
                {previewDesign.designSummary}
              </Text>
              {previewDesign.sourceKeywords.length > 0 && (
                <View style={styles.keywordsRow}>
                  {previewDesign.sourceKeywords.slice(0, 5).map((keyword, i) => (
                    <View
                      key={i}
                      style={[
                        styles.keywordBadge,
                        {
                          backgroundColor: isDark
                            ? 'rgba(167, 139, 250, 0.2)'
                            : 'rgba(124, 58, 237, 0.1)',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.keywordText,
                          { color: isDark ? '#A78BFA' : '#7C3AED' },
                        ]}
                      >
                        {keyword}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[
                  styles.secondaryButton,
                  { borderColor: isDark ? '#404040' : '#E5E7EB' },
                ]}
                onPress={handleRegenerate}
              >
                <Text
                  style={[
                    styles.secondaryButtonText,
                    { color: isDark ? '#D1D5DB' : '#4B5563' },
                  ]}
                >
                  Regenerate
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleApply}
              >
                <Sparkles size={18} color="#FFFFFF" />
                <Text style={styles.primaryButtonText}>Apply Design</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={[
              styles.generateButton,
              isGenerating && styles.generateButtonDisabled,
            ]}
            onPress={handleGenerate}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <View style={styles.loadingContent}>
                <ActivityIndicator color="#FFFFFF" />
                <Text style={styles.generateButtonText}>{generationProgress}</Text>
              </View>
            ) : (
              <>
                <Sparkles size={22} color="#FFFFFF" />
                <Text style={styles.generateButtonText}>Generate Design</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {/* Info Text */}
        <Text
          style={[
            styles.infoText,
            { color: isDark ? '#6B7280' : '#9CA3AF' },
          ]}
        >
          AI will analyze your board's hashtag and note content to create a
          unique, themed design that matches your collection.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  infoCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    gap: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  hashtagText: {
    fontSize: 20,
    fontWeight: '700',
  },
  infoLabel: {
    fontSize: 14,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 13,
    marginBottom: 12,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    minHeight: 80,
  },
  generateButton: {
    backgroundColor: '#7C3AED',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 14,
    gap: 10,
    marginBottom: 16,
  },
  generateButtonDisabled: {
    opacity: 0.7,
  },
  generateButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  loadingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  summaryCard: {
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    gap: 8,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  summaryText: {
    fontSize: 14,
    lineHeight: 20,
  },
  keywordsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  keywordBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  keywordText: {
    fontSize: 12,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#7C3AED',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  infoText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 20,
  },
});

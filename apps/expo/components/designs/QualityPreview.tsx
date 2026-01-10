/**
 * QualityPreview - Shows AI generation result with quality assessment
 *
 * Displays:
 * - Generated image preview
 * - Quality confidence indicator
 * - Warning messages if quality is low
 * - Accept/Retry/Cancel actions
 *
 * Used when sticker/character generation has quality concerns
 * to let users decide whether to accept or regenerate.
 */

import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { ArrowCounterClockwise, Check, X, Warning } from 'phosphor-react-native';
import { useTheme } from '@/src/theme';
import { QualityMetadata } from '@/types';
import { isLowQuality, getQualityLevel } from '@/utils/validation/apiResponse';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PREVIEW_SIZE = SCREEN_WIDTH * 0.7;

interface QualityPreviewProps {
  imageUri: string;
  qualityMetadata: QualityMetadata;
  onAccept: () => void;
  onRetry: () => void;
  onCancel: () => void;
  isRetrying?: boolean;
  title?: string;
}

export function QualityPreview({
  imageUri,
  qualityMetadata,
  onAccept,
  onRetry,
  onCancel,
  isRetrying = false,
  title = 'Preview',
}: QualityPreviewProps) {
  const { colors, isDark } = useTheme();
  const { qualitySignals, warnings } = qualityMetadata;

  const qualityLevel = getQualityLevel(qualityMetadata);
  const hasIssues = isLowQuality(qualityMetadata);
  const confidencePercent = Math.round(qualitySignals.confidenceScore * 100);

  // Quality indicator colors
  const qualityColors = {
    good: { bg: '#DCFCE7', text: '#166534', border: '#86EFAC' },
    fair: { bg: '#FEF3C7', text: '#92400E', border: '#FCD34D' },
    poor: { bg: '#FEE2E2', text: '#991B1B', border: '#FCA5A5' },
  };
  const qualityColor = qualityColors[qualityLevel];

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundPrimary }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
        <TouchableOpacity
          onPress={onCancel}
          style={styles.closeButton}
          accessibilityLabel="Close preview"
          accessibilityRole="button"
        >
          <X size={24} color={colors.textSecondary} weight="bold" />
        </TouchableOpacity>
      </View>

      {/* Image Preview */}
      <View style={[styles.previewContainer, { borderColor: colors.border }]}>
        <Image
          source={{ uri: imageUri }}
          style={styles.previewImage}
          resizeMode="contain"
        />
      </View>

      {/* Quality Badge */}
      <View
        style={[
          styles.qualityBadge,
          {
            backgroundColor: qualityColor.bg,
            borderColor: qualityColor.border,
          },
        ]}
      >
        <Text style={[styles.qualityText, { color: qualityColor.text }]}>
          {qualityLevel === 'good' && 'Looks good!'}
          {qualityLevel === 'fair' && 'May need adjustment'}
          {qualityLevel === 'poor' && 'Quality concerns detected'}
        </Text>
        <Text style={[styles.confidenceText, { color: qualityColor.text }]}>
          {confidencePercent}% confidence
        </Text>
      </View>

      {/* Warnings */}
      {hasIssues && warnings.length > 0 && (
        <View style={[styles.warningsContainer, { backgroundColor: isDark ? '#3F3F46' : '#FEF3C7' }]}>
          <View style={styles.warningHeader}>
            <Warning size={18} color="#92400E" weight="fill" />
            <Text style={[styles.warningTitle, { color: '#92400E' }]}>
              Potential Issues
            </Text>
          </View>
          {warnings.map((warning, index) => (
            <Text key={index} style={[styles.warningText, { color: isDark ? '#FCD34D' : '#78350F' }]}>
              {'\u2022'} {warning}
            </Text>
          ))}
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        {/* Retry Button */}
        <TouchableOpacity
          onPress={onRetry}
          disabled={isRetrying}
          style={[
            styles.actionButton,
            styles.retryButton,
            { borderColor: colors.border },
            isRetrying && styles.disabledButton,
          ]}
          accessibilityLabel="Try again"
          accessibilityRole="button"
        >
          <ArrowCounterClockwise
            size={20}
            color={isRetrying ? colors.textTertiary : colors.textSecondary}
            weight="bold"
          />
          <Text
            style={[
              styles.actionButtonText,
              { color: isRetrying ? colors.textTertiary : colors.textSecondary },
            ]}
          >
            {isRetrying ? 'Generating...' : 'Try Again'}
          </Text>
        </TouchableOpacity>

        {/* Accept Button */}
        <TouchableOpacity
          onPress={onAccept}
          disabled={isRetrying}
          style={[
            styles.actionButton,
            styles.acceptButton,
            { backgroundColor: '#4C9C9B' },
            isRetrying && styles.disabledButton,
          ]}
          accessibilityLabel="Use this image"
          accessibilityRole="button"
        >
          <Check size={20} color="white" weight="bold" />
          <Text style={[styles.actionButtonText, { color: 'white' }]}>
            Use This
          </Text>
        </TouchableOpacity>
      </View>

      {/* Hint Text */}
      <Text style={[styles.hintText, { color: colors.textTertiary }]}>
        {hasIssues
          ? 'Tap "Try Again" to generate a new version, or "Use This" to continue anyway.'
          : 'The result looks good! Tap "Use This" to continue.'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    padding: 20,
    maxWidth: 400,
    width: '90%',
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  previewContainer: {
    width: PREVIEW_SIZE,
    height: PREVIEW_SIZE,
    alignSelf: 'center',
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor: '#F5F5F5',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  qualityBadge: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  qualityText: {
    fontSize: 14,
    fontWeight: '600',
  },
  confidenceText: {
    fontSize: 13,
    fontWeight: '500',
  },
  warningsContainer: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  warningText: {
    fontSize: 13,
    lineHeight: 20,
    marginLeft: 24,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  retryButton: {
    borderWidth: 1,
  },
  acceptButton: {},
  disabledButton: {
    opacity: 0.5,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  hintText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default QualityPreview;

/**
 * AgentIntroSheet - First-time Agent Assignment UX
 *
 * A welcoming introduction sheet that appears when a user first encounters
 * an agent through mode detection. Shows agent personality, core question,
 * and skills preview.
 */

import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import {
  Clock,
  ListChecks,
  SortAscending,
  ArrowsOutSimple,
  Shuffle,
  Link,
  FolderSimple,
  Tag,
  GraduationCap,
  PencilLine,
  Sparkle,
  ChatCircleText,
  Target,
  Lightbulb,
  BookOpen,
  Notebook,
  IconProps,
} from 'phosphor-react-native';
import { useTheme } from '@/src/theme';
import { BottomSheet } from '@/src/components/sheets/BottomSheet';
import { AgentId } from '@/types';
import { AGENT_CONFIGS } from '@/services/agents/Agent';
import {
  getAgentIntroContent,
  AgentIntroSkillPreview,
} from '@/constants/agentIntroContent';

// ============================================
// Icon Mapping
// ============================================

const SKILL_ICON_MAP: Record<string, React.ComponentType<IconProps>> = {
  Clock,
  ListChecks,
  SortAscending,
  ArrowsOutSimple,
  Shuffle,
  Link,
  FolderSimple,
  Tag,
  GraduationCap,
  PencilLine,
  Sparkle,
  ChatCircleText,
};

/**
 * Get agent icon based on agent ID
 */
function AgentIcon({ agentId, color, size = 28 }: { agentId: AgentId; color: string; size?: number }) {
  switch (agentId) {
    case 'manager':
      return <Target size={size} color={color} weight="fill" />;
    case 'muse':
      return <Lightbulb size={size} color={color} weight="fill" />;
    case 'librarian':
      return <BookOpen size={size} color={color} weight="fill" />;
    case 'biographer':
      return <Notebook size={size} color={color} weight="fill" />;
    default:
      return <Lightbulb size={size} color={color} weight="fill" />;
  }
}

// ============================================
// Component Props
// ============================================

interface AgentIntroSheetProps {
  agentId: AgentId | null;
  visible: boolean;
  onDismiss: () => void;
}

// ============================================
// Component
// ============================================

export function AgentIntroSheet({ agentId, visible, onDismiss }: AgentIntroSheetProps) {
  const { colors, isDark } = useTheme();

  const handleDismiss = useCallback(() => {
    onDismiss();
  }, [onDismiss]);

  if (!agentId) return null;

  const agentConfig = AGENT_CONFIGS[agentId];
  const introContent = getAgentIntroContent(agentId);
  const agentColor = agentConfig?.color ?? colors.accent;

  // Custom header with agent branding
  const headerContent = (
    <View style={styles.header}>
      {/* Agent badge with emoji */}
      <View style={[styles.agentBadge, { backgroundColor: agentColor + '20' }]}>
        <AgentIcon agentId={agentId} color={agentColor} size={28} />
      </View>
      <View style={styles.headerText}>
        <Text style={[styles.headline, { color: colors.textPrimary }]}>
          {introContent.headline}
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {introContent.subtitle}
        </Text>
      </View>
    </View>
  );

  // Footer with "Got it" CTA
  const footerContent = (
    <TouchableOpacity
      onPress={handleDismiss}
      style={[styles.ctaButton, { backgroundColor: agentColor }]}
      accessibilityLabel="Got it"
      accessibilityRole="button"
    >
      <Text style={styles.ctaButtonText}>Got it</Text>
    </TouchableOpacity>
  );

  return (
    <BottomSheet
      visible={visible}
      onClose={handleDismiss}
      size="auto"
      showCloseButton={true}
      headerContent={headerContent}
      footerContent={footerContent}
    >
      <View style={styles.content}>
        {/* Left accent bar */}
        <View style={[styles.accentBar, { backgroundColor: agentColor }]} />

        {/* Core question in italics */}
        <View
          style={[
            styles.questionCard,
            { backgroundColor: isDark ? '#2A2A2A' : '#F9FAFB' },
          ]}
        >
          <Text style={[styles.questionText, { color: colors.textPrimary }]}>
            "{agentConfig?.coreQuestion}"
          </Text>
        </View>

        {/* Introduction text */}
        <Text style={[styles.introText, { color: colors.textSecondary }]}>
          {introContent.introduction}
        </Text>

        {/* Skills preview */}
        <View
          style={[
            styles.skillsContainer,
            { backgroundColor: isDark ? '#2A2A2A' : '#F3F4F6' },
          ]}
        >
          <Text style={[styles.skillsLabel, { color: colors.textTertiary }]}>
            WHAT TO EXPECT
          </Text>
          {introContent.skillsPreview.map((skill, index) => (
            <SkillPreviewItem
              key={index}
              skill={skill}
              agentColor={agentColor}
              textColor={colors.textPrimary}
            />
          ))}
        </View>
      </View>
    </BottomSheet>
  );
}

// ============================================
// Skill Preview Item
// ============================================

function SkillPreviewItem({
  skill,
  agentColor,
  textColor,
}: {
  skill: AgentIntroSkillPreview;
  agentColor: string;
  textColor: string;
}) {
  const IconComponent = SKILL_ICON_MAP[skill.icon];

  return (
    <View style={styles.skillItem}>
      {IconComponent && (
        <IconComponent size={18} color={agentColor} weight="regular" />
      )}
      <Text style={[styles.skillLabel, { color: textColor }]}>
        {skill.label}
      </Text>
    </View>
  );
}

// ============================================
// Styles
// ============================================

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  agentBadge: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  headerText: {
    flex: 1,
  },
  headline: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
  },
  content: {
    position: 'relative',
    paddingLeft: 8,
  },
  accentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderRadius: 2,
  },
  questionCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    marginLeft: 8,
  },
  questionText: {
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 24,
  },
  introText: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 20,
    marginLeft: 8,
  },
  skillsContainer: {
    padding: 16,
    borderRadius: 12,
    marginLeft: 8,
  },
  skillsLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  skillItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  skillLabel: {
    fontSize: 15,
    marginLeft: 12,
  },
  ctaButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
  },
  ctaButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AgentIntroSheet;

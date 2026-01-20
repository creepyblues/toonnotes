/**
 * MODE Preferences Component - MODE Framework v2.0
 *
 * User settings for controlling AI agent behavior, nudge frequency,
 * and viewing learned patterns.
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import {
  Brain,
  Target,
  Lightbulb,
  Books,
  Notebook,
  Bell,
  BellSlash,
  Gauge,
  Eraser,
} from 'phosphor-react-native';

import { SettingsSection } from './SettingsSection';
import { SettingsRow } from './SettingsRow';
import { useTheme } from '@/src/theme';
import { behaviorLearner } from '@/services/behaviorLearner';
import { AGENT_CONFIGS } from '@/services/agents/Agent';
import type { AgentId, Mode } from '@/types';

// ============================================
// Types
// ============================================

interface AgentPreference {
  agentId: AgentId;
  enabled: boolean;
  nudgeFrequency: 'off' | 'low' | 'normal' | 'high';
}

interface ModePreferencesProps {
  /** Called when preferences change */
  onPreferencesChange?: (preferences: AgentPreference[]) => void;
}

// ============================================
// Constants
// ============================================

const AGENT_ICONS: Record<AgentId, React.ReactNode> = {
  manager: <Target size={20} weight="regular" color="#FFFFFF" />,
  muse: <Lightbulb size={20} weight="regular" color="#FFFFFF" />,
  librarian: <Books size={20} weight="regular" color="#FFFFFF" />,
  biographer: <Notebook size={20} weight="regular" color="#FFFFFF" />,
};

const FREQUENCY_LABELS: Record<string, string> = {
  off: 'Off',
  low: 'Quiet',
  normal: 'Normal',
  high: 'Active',
};

const DEFAULT_PREFERENCES: AgentPreference[] = [
  { agentId: 'manager', enabled: true, nudgeFrequency: 'normal' },
  { agentId: 'muse', enabled: true, nudgeFrequency: 'normal' },
  { agentId: 'librarian', enabled: true, nudgeFrequency: 'normal' },
  { agentId: 'biographer', enabled: true, nudgeFrequency: 'low' },
];

// ============================================
// Component
// ============================================

export function ModePreferences({ onPreferencesChange }: ModePreferencesProps) {
  const { colors } = useTheme();
  const [preferences, setPreferences] = useState<AgentPreference[]>(DEFAULT_PREFERENCES);
  const [patterns, setPatterns] = useState(behaviorLearner.getPatterns());
  const [confidences, setConfidences] = useState(behaviorLearner.getAllSkillConfidences());

  // Load patterns on mount
  useEffect(() => {
    const loadData = async () => {
      await behaviorLearner.initialize();
      setPatterns(behaviorLearner.getPatterns());
      setConfidences(behaviorLearner.getAllSkillConfidences());
    };
    loadData();
  }, []);

  // Toggle agent enabled
  const toggleAgent = (agentId: AgentId) => {
    const updated = preferences.map((pref) =>
      pref.agentId === agentId ? { ...pref, enabled: !pref.enabled } : pref
    );
    setPreferences(updated);
    onPreferencesChange?.(updated);
  };

  // Cycle nudge frequency
  const cycleFrequency = (agentId: AgentId) => {
    const frequencies: Array<'off' | 'low' | 'normal' | 'high'> = ['off', 'low', 'normal', 'high'];
    const updated = preferences.map((pref) => {
      if (pref.agentId !== agentId) return pref;
      const currentIndex = frequencies.indexOf(pref.nudgeFrequency);
      const nextIndex = (currentIndex + 1) % frequencies.length;
      return { ...pref, nudgeFrequency: frequencies[nextIndex] };
    });
    setPreferences(updated);
    onPreferencesChange?.(updated);
  };

  // Reset learned data
  const handleResetLearning = () => {
    Alert.alert(
      'Reset Learning Data',
      'This will clear all learned patterns and preferences. The AI will start learning from scratch.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await behaviorLearner.reset();
            setPatterns(behaviorLearner.getPatterns());
            setConfidences({});
          },
        },
      ]
    );
  };

  // Get agent-specific stats
  const getAgentStats = (agentId: AgentId) => {
    const agentConfidences = Object.values(confidences).filter((c) =>
      c.skillId.startsWith(agentId.slice(0, 3))
    );
    if (agentConfidences.length === 0) return null;

    const avgConfidence =
      agentConfidences.reduce((sum, c) => sum + c.confidence, 0) / agentConfidences.length;
    const totalShown = agentConfidences.reduce((sum, c) => sum + c.totalShown, 0);

    return {
      avgConfidence: Math.round(avgConfidence * 100),
      totalNudges: totalShown,
    };
  };

  return (
    <View>
      {/* Smart Assistant Section */}
      <SettingsSection title="Smart Assistant">
        <SettingsRow
          icon={<Brain size={20} weight="regular" color="#FFFFFF" />}
          iconColor={colors.accent}
          label="Smart Assistant"
          subtitle="AI-powered nudges to help you stay productive"
          accessory="switch"
          switchValue={preferences.some((p) => p.enabled)}
          onSwitchChange={() => {
            const allEnabled = preferences.every((p) => p.enabled);
            const updated = preferences.map((p) => ({ ...p, enabled: !allEnabled }));
            setPreferences(updated);
            onPreferencesChange?.(updated);
          }}
          showSeparator
        />
        <SettingsRow
          icon={<Gauge size={20} weight="regular" color="#FFFFFF" />}
          iconColor="#8E8E93"
          label="Nudge Response Rate"
          value={`${Math.round(patterns.nudgeResponseRate * 100)}%`}
          accessory="none"
        />
      </SettingsSection>

      {/* Individual Agents Section */}
      <SettingsSection title="Agents">
        {preferences.map((pref, index) => {
          const config = AGENT_CONFIGS[pref.agentId];
          const stats = getAgentStats(pref.agentId);

          return (
            <SettingsRow
              key={pref.agentId}
              icon={AGENT_ICONS[pref.agentId]}
              iconColor={config.color}
              label={config.name}
              subtitle={config.coreQuestion}
              value={pref.enabled ? FREQUENCY_LABELS[pref.nudgeFrequency] : 'Off'}
              valueColor={pref.enabled ? colors.accent : colors.textTertiary}
              accessory="switch"
              switchValue={pref.enabled}
              onSwitchChange={() => toggleAgent(pref.agentId)}
              onPress={() => pref.enabled && cycleFrequency(pref.agentId)}
              showSeparator={index < preferences.length - 1}
            />
          );
        })}
      </SettingsSection>

      {/* Learned Patterns Section */}
      <SettingsSection title="Learned Patterns">
        <SettingsRow
          icon={<Bell size={20} weight="regular" color="#FFFFFF" />}
          iconColor="#34C759"
          label="Preferred Notification"
          value={patterns.preferredNudgeChannel === 'toast' ? 'Toast' : 'Sheet'}
          accessory="none"
          showSeparator
        />
        <SettingsRow
          icon={<Gauge size={20} weight="regular" color="#FFFFFF" />}
          iconColor="#5856D6"
          label="Active Hours"
          value={
            patterns.activeHours.length > 0
              ? patterns.activeHours.slice(0, 3).map((h) => `${h}:00`).join(', ')
              : 'Learning...'
          }
          accessory="none"
          showSeparator
        />
        {patterns.journalingTime !== undefined && (
          <SettingsRow
            icon={<Notebook size={20} weight="regular" color="#FFFFFF" />}
            iconColor="#A29BFE"
            label="Journaling Time"
            value={`${patterns.journalingTime}:00`}
            accessory="none"
            showSeparator
          />
        )}
        <SettingsRow
          icon={<Eraser size={20} weight="regular" color="#FFFFFF" />}
          iconColor="#FF3B30"
          label="Reset Learning Data"
          subtitle="Clear all learned patterns"
          onPress={handleResetLearning}
          accessory="chevron"
          isDestructive
        />
      </SettingsSection>

      {/* Dismissed Skills (if any) */}
      {patterns.dismissedSkillIds.length > 0 && (
        <SettingsSection title="Muted Suggestions">
          <View style={[styles.mutedInfo, { backgroundColor: colors.backgroundSecondary }]}>
            <BellSlash size={24} color={colors.textTertiary} />
            <Text style={[styles.mutedText, { color: colors.textSecondary }]}>
              {patterns.dismissedSkillIds.length} suggestion
              {patterns.dismissedSkillIds.length === 1 ? '' : 's'} muted due to frequent dismissal
            </Text>
          </View>
        </SettingsSection>
      )}
    </View>
  );
}

// ============================================
// Styles
// ============================================

const styles = StyleSheet.create({
  mutedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
    marginHorizontal: 16,
    borderRadius: 12,
    marginVertical: 8,
  },
  mutedText: {
    flex: 1,
    fontSize: 14,
  },
});

export default ModePreferences;

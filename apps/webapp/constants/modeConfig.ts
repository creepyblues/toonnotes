/**
 * MODE Framework - Tab Configuration (Webapp)
 *
 * Central configuration for MODE type tabs on the Boards page.
 * Defines icons, colors, labels, and descriptions for each cognitive mode.
 */

import {
  ListChecks,
  Lightbulb,
  FolderSimple,
  BookOpenText,
  Question,
  type IconProps,
} from '@phosphor-icons/react';
import type { Mode } from '@toonnotes/types';
import type { ComponentType } from 'react';

/**
 * Tab identifier including the 4 modes + uncategorized
 */
export type ModeTabId = Mode | 'uncategorized';

/**
 * Configuration for a single mode tab
 */
export interface ModeTabConfig {
  id: ModeTabId;
  label: string;
  shortLabel: string;
  icon: ComponentType<IconProps>;
  color: string;
  description: string;
}

/**
 * Mode tab configurations in display order
 */
export const MODE_TAB_CONFIGS: ModeTabConfig[] = [
  {
    id: 'manage',
    label: 'Manage',
    shortLabel: 'M',
    icon: ListChecks,
    color: '#FF6B6B',
    description: 'Tasks, action items, deadlines',
  },
  {
    id: 'organize',
    label: 'Organize',
    shortLabel: 'O',
    icon: FolderSimple,
    color: '#00CEC9',
    description: 'References, filing, information',
  },
  {
    id: 'develop',
    label: 'Develop',
    shortLabel: 'D',
    icon: Lightbulb,
    color: '#F59E0B',
    description: 'Ideas, creativity, brainstorming',
  },
  {
    id: 'experience',
    label: 'Experience',
    shortLabel: 'E',
    icon: BookOpenText,
    color: '#A29BFE',
    description: 'Journal, memories, reflections',
  },
  {
    id: 'uncategorized',
    label: 'Uncategorized',
    shortLabel: '?',
    icon: Question,
    color: '#9CA3AF',
    description: 'No mode assigned yet',
  },
];

/**
 * Get mode configuration by ID
 */
export function getModeConfig(modeId: ModeTabId): ModeTabConfig {
  const config = MODE_TAB_CONFIGS.find((c) => c.id === modeId);
  if (!config) {
    return MODE_TAB_CONFIGS.find((c) => c.id === 'uncategorized')!;
  }
  return config;
}

/**
 * Get all mode tab IDs
 */
export function getModeTabIds(): ModeTabId[] {
  return MODE_TAB_CONFIGS.map((c) => c.id);
}

/**
 * Check if a value is a valid Mode (not including 'uncategorized')
 */
export function isValidMode(value: string | undefined): value is Mode {
  return value === 'manage' || value === 'develop' || value === 'organize' || value === 'experience';
}

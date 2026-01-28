/**
 * MODE Framework - Tab Configuration
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
  IconProps,
} from 'phosphor-react-native';
import { Mode } from '@/types';

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
  icon: React.ComponentType<IconProps>;
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
    icon: ListChecks,
    color: '#FF6B6B', // Red
    description: 'Tasks, action items, deadlines',
  },
  {
    id: 'develop',
    label: 'Develop',
    icon: Lightbulb,
    color: '#FFEAA7', // Yellow
    description: 'Ideas, creativity, brainstorming',
  },
  {
    id: 'organize',
    label: 'Organize',
    icon: FolderSimple,
    color: '#00CEC9', // Teal
    description: 'References, filing, information',
  },
  {
    id: 'experience',
    label: 'Experience',
    icon: BookOpenText,
    color: '#A29BFE', // Purple
    description: 'Journal, memories, reflections',
  },
  {
    id: 'uncategorized',
    label: 'Uncategorized',
    icon: Question,
    color: '#9CA3AF', // Gray
    description: 'No mode assigned yet',
  },
];

/**
 * Get mode configuration by ID
 */
export function getModeConfig(modeId: ModeTabId): ModeTabConfig {
  const config = MODE_TAB_CONFIGS.find((c) => c.id === modeId);
  if (!config) {
    // Fallback to uncategorized if mode not found
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

/**
 * Onboarding Configuration
 *
 * Central config for welcome carousel and coach marks.
 * Can be updated via remote config without app release.
 */

import { ImageSourcePropType } from 'react-native';

// ============================================================================
// Types
// ============================================================================

export interface CarouselSlide {
  id: string;
  title: string;
  subtitle: string;
  /** Local asset or remote URL */
  image?: ImageSourcePropType | string;
  /** Accent color for the slide (hex) */
  accentColor: string;
  /** Background color for the slide (hex) */
  backgroundColor: string;
}

export interface CoachMark {
  id: string;
  /** Title shown in tooltip */
  title: string;
  /** Description shown in tooltip */
  description: string;
  /** Preferred position relative to target */
  position: 'top' | 'bottom' | 'left' | 'right';
  /** Screen where this coach mark should appear */
  triggerScreen?: string;
  /** Action that triggers this coach mark */
  triggerAction?: string;
  /** Order in sequence (lower = earlier) */
  order: number;
}

export interface OnboardingConfig {
  version: number;
  carousel: {
    slides: CarouselSlide[];
    skipButtonText: string;
    nextButtonText: string;
    doneButtonText: string;
  };
  coachMarks: CoachMark[];
  featureFlags: {
    showCarousel: boolean;
    showCoachMarks: boolean;
  };
}

// ============================================================================
// Coach Mark IDs (constants for type safety)
// ============================================================================

export const COACH_MARK_IDS = {
  // Note Editor flow
  NOTE_TITLE: 'note-title',
  NOTE_CONTENT: 'note-content',
  EDITOR_MODES: 'editor-modes',

  // Hashtag discovery
  HASHTAG_INTRO: 'hashtag-intro',

  // Tab discovery
  BOARDS_TAB: 'boards-tab',
  DESIGNS_TAB: 'designs-tab',

  // Design creation
  DESIGN_CREATE: 'design-create',

  // Goal system
  GOAL_TIPS: 'goal-tips',
} as const;

export type CoachMarkId = (typeof COACH_MARK_IDS)[keyof typeof COACH_MARK_IDS];

// ============================================================================
// Default Configuration (bundled fallback)
// ============================================================================

export const DEFAULT_CAROUSEL_SLIDES: CarouselSlide[] = [
  {
    id: 'welcome-notes',
    title: 'Capture ideas your way',
    subtitle: 'Quick notes, checklists, or bullet lists—whatever works for you',
    accentColor: '#4C9C9B', // Teal primary
    backgroundColor: '#F0FDFA', // Light teal background
  },
  {
    id: 'welcome-labels',
    title: 'Smart labels organize for you',
    subtitle: 'AI automatically adds labels to your notes and groups them into boards',
    accentColor: '#8B5CF6', // Purple
    backgroundColor: '#F5F3FF', // Light purple background
  },
  {
    id: 'welcome-designs',
    title: 'AI-powered designs',
    subtitle: 'Turn any image into a theme with character sticker and background',
    accentColor: '#F472B6', // Pink
    backgroundColor: '#FDF2F8', // Light pink background
  },
  {
    id: 'welcome-start',
    title: "Let's get started!",
    subtitle: 'Your first design is free',
    accentColor: '#4C9C9B', // Teal primary
    backgroundColor: '#FFFFFF',
  },
];

export const DEFAULT_COACH_MARKS: CoachMark[] = [
  {
    id: COACH_MARK_IDS.NOTE_TITLE,
    title: 'Give your note a title',
    description: 'A title helps you find notes quickly',
    position: 'bottom',
    triggerScreen: 'note-editor',
    triggerAction: 'first-note-create',
    order: 1,
  },
  {
    id: COACH_MARK_IDS.NOTE_CONTENT,
    title: 'Start writing',
    description: 'Jot down your ideas, thoughts, or lists',
    position: 'top',
    triggerScreen: 'note-editor',
    triggerAction: 'after-title',
    order: 2,
  },
  {
    id: COACH_MARK_IDS.EDITOR_MODES,
    title: 'Try different modes',
    description: 'Switch between text, checklist, or bullet lists',
    position: 'top',
    triggerScreen: 'note-editor',
    triggerAction: 'after-first-save',
    order: 3,
  },
  {
    id: COACH_MARK_IDS.HASHTAG_INTRO,
    title: 'Hashtags create boards!',
    description: 'Notes with #tags automatically group together',
    position: 'bottom',
    triggerScreen: 'note-editor',
    triggerAction: 'first-hashtag',
    order: 4,
  },
  {
    id: COACH_MARK_IDS.BOARDS_TAB,
    title: 'Your boards live here',
    description: 'All your hashtags organized in one place',
    position: 'top',
    triggerScreen: 'boards-tab',
    triggerAction: 'first-visit',
    order: 5,
  },
  {
    id: COACH_MARK_IDS.DESIGNS_TAB,
    title: 'Your first design is free!',
    description: 'Create a custom theme from any image',
    position: 'top',
    triggerScreen: 'designs-tab',
    triggerAction: 'first-visit',
    order: 6,
  },
  {
    id: COACH_MARK_IDS.DESIGN_CREATE,
    title: 'Pick any image',
    description: 'AI will extract colors and create a theme',
    position: 'bottom',
    triggerScreen: 'design-create',
    triggerAction: 'first-visit',
    order: 7,
  },
  {
    id: COACH_MARK_IDS.GOAL_TIPS,
    title: 'AI reads your notes',
    description: 'Include dates and action items for smarter nudges and goal tracking',
    position: 'top',
    triggerScreen: 'note-editor',
    triggerAction: 'first-goal-shown',
    order: 8,
  },
];

export const DEFAULT_ONBOARDING_CONFIG: OnboardingConfig = {
  version: 1,
  carousel: {
    slides: DEFAULT_CAROUSEL_SLIDES,
    skipButtonText: 'Skip',
    nextButtonText: 'Next',
    doneButtonText: 'Get Started',
  },
  coachMarks: DEFAULT_COACH_MARKS,
  featureFlags: {
    showCarousel: true,
    showCoachMarks: true,
  },
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get a coach mark by ID from config
 */
export function getCoachMarkById(
  config: OnboardingConfig,
  id: CoachMarkId
): CoachMark | undefined {
  return config.coachMarks.find((cm) => cm.id === id);
}

/**
 * Merge remote config with defaults (remote takes precedence)
 */
export function mergeWithDefaults(
  remoteConfig: Partial<OnboardingConfig>
): OnboardingConfig {
  return {
    version: remoteConfig.version ?? DEFAULT_ONBOARDING_CONFIG.version,
    carousel: {
      ...DEFAULT_ONBOARDING_CONFIG.carousel,
      ...remoteConfig.carousel,
      slides:
        remoteConfig.carousel?.slides ?? DEFAULT_ONBOARDING_CONFIG.carousel.slides,
    },
    coachMarks: remoteConfig.coachMarks ?? DEFAULT_ONBOARDING_CONFIG.coachMarks,
    featureFlags: {
      ...DEFAULT_ONBOARDING_CONFIG.featureFlags,
      ...remoteConfig.featureFlags,
    },
  };
}

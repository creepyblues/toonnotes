import type { VercelRequest, VercelResponse } from '@vercel/node';
import { applySecurity } from './_utils/security';

/**
 * Onboarding Config Edge Function
 *
 * Returns the onboarding configuration (carousel slides, coach marks, feature flags).
 * This allows updating onboarding content without app store releases.
 *
 * GET /api/onboarding-config
 *
 * Response:
 * {
 *   version: number,
 *   carousel: { slides: [...], skipButtonText: string, ... },
 *   coachMarks: [...],
 *   featureFlags: { showCarousel: boolean, showCoachMarks: boolean }
 * }
 */

// ============================================================================
// Types
// ============================================================================

interface CarouselSlide {
  id: string;
  title: string;
  subtitle: string;
  accentColor: string;
  backgroundColor: string;
}

interface CoachMark {
  id: string;
  title: string;
  description: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  triggerScreen?: string;
  triggerAction?: string;
  order: number;
}

interface OnboardingConfig {
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
// Configuration
// ============================================================================

/**
 * The onboarding config.
 * Edit this to update the onboarding experience without app releases.
 */
const ONBOARDING_CONFIG: OnboardingConfig = {
  version: 1,
  carousel: {
    slides: [
      {
        id: 'welcome-notes',
        title: 'Capture ideas your way',
        subtitle:
          'Quick notes, checklists, or bullet lists—whatever works for you',
        accentColor: '#4C9C9B',
        backgroundColor: '#F0FDFA',
      },
      {
        id: 'welcome-labels',
        title: 'Smart labels organize for you',
        subtitle: 'AI automatically adds labels to your notes and groups them into boards',
        accentColor: '#8B5CF6',
        backgroundColor: '#F5F3FF',
      },
      {
        id: 'welcome-designs',
        title: 'AI-powered designs',
        subtitle: 'Turn any image into a theme with character sticker and background',
        accentColor: '#F472B6',
        backgroundColor: '#FDF2F8',
      },
      {
        id: 'welcome-start',
        title: "Let's get started!",
        subtitle: 'Your first design is free',
        accentColor: '#4C9C9B',
        backgroundColor: '#FFFFFF',
      },
    ],
    skipButtonText: 'Skip',
    nextButtonText: 'Next',
    doneButtonText: 'Get Started',
  },
  coachMarks: [
    {
      id: 'note-title',
      title: 'Give your note a title',
      description: 'A title helps you find notes quickly',
      position: 'bottom',
      triggerScreen: 'note-editor',
      triggerAction: 'first-note-create',
      order: 1,
    },
    {
      id: 'note-content',
      title: 'Start writing',
      description: 'Jot down your ideas, thoughts, or lists',
      position: 'top',
      triggerScreen: 'note-editor',
      triggerAction: 'after-title',
      order: 2,
    },
    {
      id: 'editor-modes',
      title: 'Try different modes',
      description: 'Switch between text, checklist, or bullet lists',
      position: 'top',
      triggerScreen: 'note-editor',
      triggerAction: 'after-first-save',
      order: 3,
    },
    {
      id: 'hashtag-intro',
      title: 'Hashtags create boards!',
      description: 'Notes with #tags automatically group together',
      position: 'bottom',
      triggerScreen: 'note-editor',
      triggerAction: 'first-hashtag',
      order: 4,
    },
    {
      id: 'boards-tab',
      title: 'Your boards live here',
      description: 'All your hashtags organized in one place',
      position: 'top',
      triggerScreen: 'boards-tab',
      triggerAction: 'first-visit',
      order: 5,
    },
    {
      id: 'designs-tab',
      title: 'Your first design is free!',
      description: 'Create a custom theme from any image',
      position: 'top',
      triggerScreen: 'designs-tab',
      triggerAction: 'first-visit',
      order: 6,
    },
    {
      id: 'design-create',
      title: 'Pick any image',
      description: 'AI will extract colors and create a theme',
      position: 'bottom',
      triggerScreen: 'design-create',
      triggerAction: 'first-visit',
      order: 7,
    },
  ],
  featureFlags: {
    showCarousel: true,
    showCoachMarks: true,
  },
};

// ============================================================================
// Handler
// ============================================================================

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Apply security middleware (CORS, rate limiting, method validation)
  // Skip rate limiting for config endpoint (frequently called, read-only)
  if (!applySecurity(req, res, { allowedMethods: ['GET'], skipRateLimit: true })) {
    return;
  }

  // Return config with cache headers
  // Cache for 1 hour on CDN, revalidate in background
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');

  return res.status(200).json(ONBOARDING_CONFIG);
}

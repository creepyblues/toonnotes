/**
 * Agent Intro Trigger Hook - First-time Agent Assignment UX
 *
 * Detects when a user should see an agent introduction sheet after
 * mode detection assigns a new mode to their note.
 *
 * Shows the intro only once per agent, with a 500ms delay for smooth transition.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useBehaviorStore } from '@/stores/behaviorStore';
import { useUserStore } from '@/stores/userStore';
import { AgentId, Mode, Note } from '@/types';
import { modeToAgentId } from '@/services/agents/Agent';
import { detectModeForNote } from '@/services/modeDetectionService';
import { Analytics } from '@/services/firebaseAnalytics';

// ============================================
// Hook Interface
// ============================================

interface AgentIntroTriggerResult {
  /** The agent ID to show intro for (null if no intro needed) */
  showIntroFor: AgentId | null;
  /** Clear the intro trigger (call after sheet is dismissed) */
  clearIntro: () => void;
  /** Mark the current agent intro as seen */
  markIntroSeen: () => void;
  /** Manually trigger mode detection and intro check for a note */
  checkForIntro: (note: Note) => void;
}

// ============================================
// Hook Implementation
// ============================================

/**
 * Hook to manage agent intro sheet visibility
 *
 * @param noteId - The ID of the note being edited
 * @returns Object with intro state and control functions
 */
export function useAgentIntroTrigger(noteId: string | undefined): AgentIntroTriggerResult {
  const [showIntroFor, setShowIntroFor] = useState<AgentId | null>(null);

  // Get behavior from store
  const getBehavior = useBehaviorStore((state) => state.getBehavior);
  const initBehavior = useBehaviorStore((state) => state.initBehavior);

  // Get intro state from user store
  const hasSeenAgentIntro = useUserStore((state) => state.hasSeenAgentIntro);
  const markAgentIntroSeen = useUserStore((state) => state.markAgentIntroSeen);

  // Track if we've already checked this note session
  const hasCheckedRef = useRef(false);
  const previousModeRef = useRef<Mode | null>(null);

  /**
   * Clear the intro trigger
   */
  const clearIntro = useCallback(() => {
    setShowIntroFor(null);
  }, []);

  /**
   * Mark the current agent intro as seen and dismiss
   */
  const markIntroSeen = useCallback(() => {
    if (showIntroFor) {
      markAgentIntroSeen(showIntroFor);
      Analytics.agentIntroDismissed(showIntroFor);
      setShowIntroFor(null);
    }
  }, [showIntroFor, markAgentIntroSeen]);

  /**
   * Check if we should show an intro for the detected mode
   */
  const checkForIntro = useCallback((note: Note) => {
    if (!note || hasCheckedRef.current) return;

    // Detect mode from note content
    const detectionResult = detectModeForNote(note);
    const { mode, confidence } = detectionResult;

    // Skip if low confidence or same mode as before
    if (confidence < 0.3 || mode === previousModeRef.current) {
      return;
    }

    previousModeRef.current = mode;

    // Get the corresponding agent
    const agentId = modeToAgentId(mode);

    // Check if user has seen this agent's intro
    if (!hasSeenAgentIntro(agentId)) {
      // Initialize behavior if needed
      const existingBehavior = getBehavior(note.id);
      if (!existingBehavior) {
        initBehavior(note.id, mode, detectionResult.organizeStage);
      }

      // Show intro with delay for smooth transition
      hasCheckedRef.current = true;
      setTimeout(() => {
        setShowIntroFor(agentId);
        Analytics.agentIntroShown(agentId);
      }, 500);
    }
  }, [hasSeenAgentIntro, getBehavior, initBehavior]);

  /**
   * Reset check state when note changes
   */
  useEffect(() => {
    if (noteId) {
      hasCheckedRef.current = false;
      previousModeRef.current = null;
    }
  }, [noteId]);

  /**
   * Watch for mode changes in existing behaviors
   */
  useEffect(() => {
    if (!noteId) return;

    const behavior = getBehavior(noteId);
    if (!behavior?.mode) return;

    // If mode exists but we haven't checked intro yet
    if (!hasCheckedRef.current) {
      const agentId = modeToAgentId(behavior.mode);
      if (!hasSeenAgentIntro(agentId)) {
        hasCheckedRef.current = true;
        setTimeout(() => {
          setShowIntroFor(agentId);
          Analytics.agentIntroShown(agentId);
        }, 500);
      }
    }
  }, [noteId, getBehavior, hasSeenAgentIntro]);

  return {
    showIntroFor,
    clearIntro,
    markIntroSeen,
    checkForIntro,
  };
}

export default useAgentIntroTrigger;

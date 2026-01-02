/**
 * User Store - Onboarding State Unit Tests
 */

import { renderHook, act } from '@testing-library/react-native';
import { useUserStore } from '@/stores/userStore';
import { COACH_MARK_IDS } from '@/constants/onboardingConfig';

describe('UserStore - Onboarding', () => {
  beforeEach(() => {
    // Reset store to initial state
    useUserStore.setState({
      onboarding: {
        hasCompletedWelcome: false,
        seenCoachMarks: [],
        onboardingVersion: 1,
        notesCreatedCount: 0,
      },
    });
  });

  describe('Initial Onboarding State', () => {
    it('should have correct initial onboarding state', () => {
      const state = useUserStore.getState();

      expect(state.onboarding.hasCompletedWelcome).toBe(false);
      expect(state.onboarding.seenCoachMarks).toEqual([]);
      expect(state.onboarding.onboardingVersion).toBe(1);
      expect(state.onboarding.notesCreatedCount).toBe(0);
    });
  });

  describe('completeWelcome', () => {
    it('should set hasCompletedWelcome to true', () => {
      const { result } = renderHook(() => useUserStore());

      act(() => {
        result.current.completeWelcome();
      });

      expect(result.current.onboarding.hasCompletedWelcome).toBe(true);
    });

    it('should preserve other onboarding state', () => {
      useUserStore.setState({
        onboarding: {
          hasCompletedWelcome: false,
          seenCoachMarks: ['test-mark'],
          onboardingVersion: 2,
          notesCreatedCount: 5,
        },
      });

      const { result } = renderHook(() => useUserStore());

      act(() => {
        result.current.completeWelcome();
      });

      expect(result.current.onboarding.seenCoachMarks).toEqual(['test-mark']);
      expect(result.current.onboarding.onboardingVersion).toBe(2);
      expect(result.current.onboarding.notesCreatedCount).toBe(5);
    });
  });

  describe('markCoachMarkSeen', () => {
    it('should add coach mark ID to seenCoachMarks', () => {
      const { result } = renderHook(() => useUserStore());

      act(() => {
        result.current.markCoachMarkSeen(COACH_MARK_IDS.NOTE_TITLE);
      });

      expect(result.current.onboarding.seenCoachMarks).toContain(
        COACH_MARK_IDS.NOTE_TITLE
      );
    });

    it('should not add duplicate coach marks', () => {
      const { result } = renderHook(() => useUserStore());

      act(() => {
        result.current.markCoachMarkSeen(COACH_MARK_IDS.NOTE_TITLE);
        result.current.markCoachMarkSeen(COACH_MARK_IDS.NOTE_TITLE);
      });

      const occurrences = result.current.onboarding.seenCoachMarks.filter(
        (id) => id === COACH_MARK_IDS.NOTE_TITLE
      );
      expect(occurrences.length).toBe(1);
    });

    it('should allow multiple different coach marks', () => {
      const { result } = renderHook(() => useUserStore());

      act(() => {
        result.current.markCoachMarkSeen(COACH_MARK_IDS.NOTE_TITLE);
        result.current.markCoachMarkSeen(COACH_MARK_IDS.HASHTAG_INTRO);
        result.current.markCoachMarkSeen(COACH_MARK_IDS.DESIGN_CREATE);
      });

      expect(result.current.onboarding.seenCoachMarks).toHaveLength(3);
      expect(result.current.onboarding.seenCoachMarks).toContain(
        COACH_MARK_IDS.NOTE_TITLE
      );
      expect(result.current.onboarding.seenCoachMarks).toContain(
        COACH_MARK_IDS.HASHTAG_INTRO
      );
      expect(result.current.onboarding.seenCoachMarks).toContain(
        COACH_MARK_IDS.DESIGN_CREATE
      );
    });
  });

  describe('hasSeenCoachMark', () => {
    it('should return false for unseen coach marks', () => {
      const { result } = renderHook(() => useUserStore());

      expect(result.current.hasSeenCoachMark(COACH_MARK_IDS.NOTE_TITLE)).toBe(
        false
      );
    });

    it('should return true for seen coach marks', () => {
      useUserStore.setState({
        onboarding: {
          hasCompletedWelcome: false,
          seenCoachMarks: [COACH_MARK_IDS.NOTE_TITLE],
          onboardingVersion: 1,
          notesCreatedCount: 0,
        },
      });

      const { result } = renderHook(() => useUserStore());

      expect(result.current.hasSeenCoachMark(COACH_MARK_IDS.NOTE_TITLE)).toBe(
        true
      );
    });
  });

  describe('setOnboardingVersion', () => {
    it('should update onboarding version', () => {
      const { result } = renderHook(() => useUserStore());

      act(() => {
        result.current.setOnboardingVersion(3);
      });

      expect(result.current.onboarding.onboardingVersion).toBe(3);
    });
  });

  describe('incrementNotesCreated', () => {
    it('should increment notes created count', () => {
      const { result } = renderHook(() => useUserStore());

      act(() => {
        result.current.incrementNotesCreated();
      });

      expect(result.current.onboarding.notesCreatedCount).toBe(1);
    });

    it('should increment multiple times', () => {
      const { result } = renderHook(() => useUserStore());

      act(() => {
        result.current.incrementNotesCreated();
        result.current.incrementNotesCreated();
        result.current.incrementNotesCreated();
      });

      expect(result.current.onboarding.notesCreatedCount).toBe(3);
    });
  });

  describe('resetOnboarding', () => {
    it('should reset onboarding to initial state', () => {
      // Setup completed onboarding state
      useUserStore.setState({
        onboarding: {
          hasCompletedWelcome: true,
          seenCoachMarks: [
            COACH_MARK_IDS.NOTE_TITLE,
            COACH_MARK_IDS.HASHTAG_INTRO,
          ],
          onboardingVersion: 2,
          notesCreatedCount: 10,
        },
      });

      const { result } = renderHook(() => useUserStore());

      act(() => {
        result.current.resetOnboarding();
      });

      expect(result.current.onboarding.hasCompletedWelcome).toBe(false);
      expect(result.current.onboarding.seenCoachMarks).toEqual([]);
      expect(result.current.onboarding.notesCreatedCount).toBe(0);
    });

    it('should reset onboarding version to initial value', () => {
      useUserStore.setState({
        onboarding: {
          hasCompletedWelcome: true,
          seenCoachMarks: [COACH_MARK_IDS.NOTE_TITLE],
          onboardingVersion: 3,
          notesCreatedCount: 5,
        },
      });

      const { result } = renderHook(() => useUserStore());

      act(() => {
        result.current.resetOnboarding();
      });

      // Reset goes back to initial state (version 0)
      expect(result.current.onboarding.onboardingVersion).toBe(0);
    });
  });

  describe('Onboarding Flow Integration', () => {
    it('should support complete onboarding flow', () => {
      const { result } = renderHook(() => useUserStore());

      // Initial state - user hasn't seen anything
      expect(result.current.onboarding.hasCompletedWelcome).toBe(false);
      expect(result.current.hasSeenCoachMark(COACH_MARK_IDS.NOTE_TITLE)).toBe(
        false
      );

      // User completes welcome carousel
      act(() => {
        result.current.completeWelcome();
      });
      expect(result.current.onboarding.hasCompletedWelcome).toBe(true);

      // User sees first coach mark
      act(() => {
        result.current.markCoachMarkSeen(COACH_MARK_IDS.NOTE_TITLE);
      });
      expect(result.current.hasSeenCoachMark(COACH_MARK_IDS.NOTE_TITLE)).toBe(
        true
      );

      // User creates notes
      act(() => {
        result.current.incrementNotesCreated();
        result.current.incrementNotesCreated();
      });
      expect(result.current.onboarding.notesCreatedCount).toBe(2);

      // User sees more coach marks
      act(() => {
        result.current.markCoachMarkSeen(COACH_MARK_IDS.HASHTAG_INTRO);
        result.current.markCoachMarkSeen(COACH_MARK_IDS.DESIGN_CREATE);
      });

      expect(result.current.onboarding.seenCoachMarks).toHaveLength(3);
    });
  });
});

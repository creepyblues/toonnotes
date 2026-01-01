/**
 * Coach Marks Provider
 *
 * Provides spotlight tour functionality for progressive feature discovery.
 * Wraps the app and manages the tour state.
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {
  SpotlightTourProvider,
  TourStep,
  useSpotlightTour,
} from 'react-native-spotlight-tour';
import { X } from 'phosphor-react-native';
import { useUserStore } from '@/stores';
import {
  CoachMark,
  CoachMarkId,
  DEFAULT_COACH_MARKS,
  COACH_MARK_IDS,
} from '@/constants/onboardingConfig';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ============================================================================
// Context
// ============================================================================

interface CoachMarksContextValue {
  /** Check if a coach mark should be shown */
  shouldShowCoachMark: (id: CoachMarkId | string) => boolean;
  /** Start a tour with specific coach marks */
  startTour: (markIds: (CoachMarkId | string)[]) => void;
  /** Get coach mark config by ID */
  getCoachMark: (id: CoachMarkId | string) => CoachMark | undefined;
  /** Mark a coach mark as seen without showing it */
  dismissCoachMark: (id: CoachMarkId | string) => void;
  /** Current coach marks config */
  coachMarks: CoachMark[];
}

const CoachMarksContext = createContext<CoachMarksContextValue | null>(null);

// ============================================================================
// Custom Tooltip Component
// ============================================================================

interface TooltipProps {
  title: string;
  description: string;
  onNext?: () => void;
  onPrevious?: () => void;
  onStop?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
  currentStep?: number;
  totalSteps?: number;
}

const Tooltip = ({
  title,
  description,
  onNext,
  onStop,
  isLast,
  currentStep = 1,
  totalSteps = 1,
}: TooltipProps) => {
  return (
    <View style={styles.tooltipContainer}>
      {/* Close button */}
      <TouchableOpacity
        style={styles.closeButton}
        onPress={onStop}
        accessibilityLabel="Close tooltip"
        accessibilityRole="button"
      >
        <X size={16} color="#78716C" weight="bold" />
      </TouchableOpacity>

      {/* Content */}
      <Text style={styles.tooltipTitle}>{title}</Text>
      <Text style={styles.tooltipDescription}>{description}</Text>

      {/* Footer */}
      <View style={styles.tooltipFooter}>
        {totalSteps > 1 && (
          <Text style={styles.stepIndicator}>
            {currentStep} / {totalSteps}
          </Text>
        )}

        <TouchableOpacity
          style={styles.actionButton}
          onPress={isLast ? onStop : onNext}
          accessibilityLabel={isLast ? 'Got it' : 'Next tip'}
          accessibilityRole="button"
        >
          <Text style={styles.actionButtonText}>
            {isLast ? 'Got it!' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ============================================================================
// Provider Implementation
// ============================================================================

interface CoachMarksProviderProps {
  children: React.ReactNode;
}

export function CoachMarksProvider({ children }: CoachMarksProviderProps) {
  const { onboarding, hasSeenCoachMark, markCoachMarkSeen } = useUserStore();
  const [coachMarks] = useState<CoachMark[]>(DEFAULT_COACH_MARKS);
  const [activeTourMarks, setActiveTourMarks] = useState<CoachMark[]>([]);

  // Check if a coach mark should be shown
  const shouldShowCoachMark = useCallback(
    (id: CoachMarkId | string): boolean => {
      // Don't show if user hasn't completed welcome carousel
      if (!onboarding.hasCompletedWelcome) {
        return false;
      }

      // Don't show if already seen
      if (hasSeenCoachMark(id)) {
        return false;
      }

      return true;
    },
    [onboarding.hasCompletedWelcome, hasSeenCoachMark]
  );

  // Get coach mark config
  const getCoachMark = useCallback(
    (id: CoachMarkId | string): CoachMark | undefined => {
      return coachMarks.find((cm) => cm.id === id);
    },
    [coachMarks]
  );

  // Dismiss a coach mark without showing
  const dismissCoachMark = useCallback(
    (id: CoachMarkId | string) => {
      markCoachMarkSeen(id);
    },
    [markCoachMarkSeen]
  );

  // Build tour steps from coach marks
  const buildTourSteps = useCallback(
    (marks: CoachMark[]): TourStep[] => {
      return marks.map((mark, index) => ({
        render: ({ next, stop }) => (
          <Tooltip
            title={mark.title}
            description={mark.description}
            onNext={() => {
              markCoachMarkSeen(mark.id);
              next();
            }}
            onStop={() => {
              markCoachMarkSeen(mark.id);
              stop();
            }}
            isLast={index === marks.length - 1}
            currentStep={index + 1}
            totalSteps={marks.length}
          />
        ),
      }));
    },
    [markCoachMarkSeen]
  );

  // Start a tour with specific marks
  const startTour = useCallback(
    (markIds: (CoachMarkId | string)[]) => {
      const marks = markIds
        .map((id) => getCoachMark(id))
        .filter((m): m is CoachMark => m !== undefined && shouldShowCoachMark(m.id));

      if (marks.length === 0) {
        return;
      }

      setActiveTourMarks(marks);
    },
    [getCoachMark, shouldShowCoachMark]
  );

  const contextValue: CoachMarksContextValue = {
    shouldShowCoachMark,
    startTour,
    getCoachMark,
    dismissCoachMark,
    coachMarks,
  };

  const tourSteps = buildTourSteps(activeTourMarks);

  return (
    <CoachMarksContext.Provider value={contextValue}>
      <SpotlightTourProvider
        steps={tourSteps}
        overlayColor="rgba(0, 0, 0, 0.7)"
        overlayOpacity={1}
        nativeDriver={true}
        onBackdropPress="stop"
      >
        {children}
      </SpotlightTourProvider>
    </CoachMarksContext.Provider>
  );
}

// ============================================================================
// Hook
// ============================================================================

export function useCoachMarks() {
  const context = useContext(CoachMarksContext);
  if (!context) {
    throw new Error('useCoachMarks must be used within a CoachMarksProvider');
  }
  return context;
}

// Re-export the spotlight tour hook for direct access
export { useSpotlightTour };

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  tooltipContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    maxWidth: SCREEN_WIDTH - 48,
    minWidth: 280,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F5F5F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tooltipTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1917',
    marginBottom: 8,
    paddingRight: 32,
    fontFamily: 'Inter_700Bold',
  },
  tooltipDescription: {
    fontSize: 15,
    color: '#57534E',
    lineHeight: 22,
    marginBottom: 16,
    fontFamily: 'Inter_400Regular',
  },
  tooltipFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepIndicator: {
    fontSize: 13,
    color: '#A8A29E',
    fontFamily: 'Inter_500Medium',
  },
  actionButton: {
    backgroundColor: '#4C9C9B',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Inter_600SemiBold',
  },
});

export default CoachMarksProvider;

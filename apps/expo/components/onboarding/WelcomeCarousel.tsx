/**
 * Welcome Carousel
 *
 * A beautiful 4-screen onboarding carousel that introduces users to ToonNotes.
 * Shows on first launch only.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
  SafeAreaView,
} from 'react-native';
import Onboarding from 'react-native-onboarding-swiper';
import {
  NotePencil,
  Tag,
  Sparkle,
  Rocket,
  CheckSquare,
  ListBullets,
  SquaresFour,
  ImageSquare,
} from 'phosphor-react-native';
import { useTheme } from '@/src/theme';
import {
  CarouselSlide,
  DEFAULT_CAROUSEL_SLIDES,
} from '@/constants/onboardingConfig';
import { getOnboardingConfig } from '@/services/onboardingService';

const { width, height } = Dimensions.get('window');

// ============================================================================
// Props
// ============================================================================

interface WelcomeCarouselProps {
  onComplete: () => void;
}

// ============================================================================
// Custom Components for Onboarding
// ============================================================================

interface DotProps {
  selected: boolean;
  isLight?: boolean;
}

const Dot = ({ selected, isLight }: DotProps) => {
  const backgroundColor = selected
    ? isLight
      ? '#1C1917'
      : '#4C9C9B'
    : isLight
      ? 'rgba(28, 25, 23, 0.3)'
      : 'rgba(76, 156, 155, 0.3)';

  return (
    <View
      style={[
        styles.dot,
        {
          backgroundColor,
          width: selected ? 24 : 8,
        },
      ]}
    />
  );
};

interface SkipButtonProps {
  onPress: () => void;
  isLight?: boolean;
}

const SkipButton = ({ onPress, isLight }: SkipButtonProps) => (
  <TouchableOpacity
    onPress={onPress}
    style={styles.skipButton}
    accessibilityLabel="Skip onboarding"
    accessibilityRole="button"
  >
    <Text style={[styles.skipText, isLight && styles.skipTextDark]}>Skip</Text>
  </TouchableOpacity>
);

interface NextButtonProps {
  onPress: () => void;
  isLight?: boolean;
}

const NextButton = ({ onPress, isLight }: NextButtonProps) => (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.nextButton, isLight && styles.nextButtonDark]}
    accessibilityLabel="Next slide"
    accessibilityRole="button"
  >
    <Text style={[styles.nextText, isLight && styles.nextTextDark]}>Next</Text>
  </TouchableOpacity>
);

interface DoneButtonProps {
  onPress: () => void;
}

const DoneButton = ({ onPress }: DoneButtonProps) => (
  <TouchableOpacity
    onPress={onPress}
    style={styles.doneButton}
    accessibilityLabel="Get started with ToonNotes"
    accessibilityRole="button"
  >
    <Text style={styles.doneText}>Get Started</Text>
    <Rocket size={20} color="#FFFFFF" weight="fill" />
  </TouchableOpacity>
);

// ============================================================================
// Slide Illustrations
// ============================================================================

interface SlideIllustrationProps {
  slideId: string;
  accentColor: string;
}

const SlideIllustration = ({ slideId, accentColor }: SlideIllustrationProps) => {
  const scaleAnim = React.useRef(new Animated.Value(0.8)).current;
  const opacityAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, [slideId]);

  const renderIcons = () => {
    switch (slideId) {
      case 'welcome-notes':
        return (
          <View style={styles.iconCluster}>
            <View style={[styles.iconCircle, { backgroundColor: accentColor }]}>
              <NotePencil size={48} color="#FFFFFF" weight="fill" />
            </View>
            <View
              style={[
                styles.smallIconCircle,
                styles.smallIconTopRight,
                { backgroundColor: '#F472B6' },
              ]}
            >
              <CheckSquare size={24} color="#FFFFFF" weight="fill" />
            </View>
            <View
              style={[
                styles.smallIconCircle,
                styles.smallIconBottomLeft,
                { backgroundColor: '#8B5CF6' },
              ]}
            >
              <ListBullets size={24} color="#FFFFFF" weight="fill" />
            </View>
          </View>
        );

      case 'welcome-labels':
        return (
          <View style={styles.iconCluster}>
            <View style={[styles.iconCircle, { backgroundColor: accentColor }]}>
              <Tag size={48} color="#FFFFFF" weight="fill" />
            </View>
            <View
              style={[
                styles.smallIconCircle,
                styles.smallIconTopRight,
                { backgroundColor: '#4C9C9B' },
              ]}
            >
              <SquaresFour size={24} color="#FFFFFF" weight="fill" />
            </View>
          </View>
        );

      case 'welcome-designs':
        return (
          <View style={styles.iconCluster}>
            <View style={[styles.iconCircle, { backgroundColor: accentColor }]}>
              <ImageSquare size={48} color="#FFFFFF" weight="fill" />
            </View>
            <View
              style={[
                styles.smallIconCircle,
                styles.smallIconTopRight,
                { backgroundColor: '#4C9C9B' },
              ]}
            >
              <Sparkle size={24} color="#FFFFFF" weight="fill" />
            </View>
          </View>
        );

      case 'welcome-start':
        return (
          <View style={styles.iconCluster}>
            <View style={[styles.iconCircle, { backgroundColor: accentColor }]}>
              <Rocket size={48} color="#FFFFFF" weight="fill" />
            </View>
            <View
              style={[
                styles.smallIconCircle,
                styles.smallIconTopRight,
                { backgroundColor: '#F472B6' },
              ]}
            >
              <Sparkle size={24} color="#FFFFFF" weight="fill" />
            </View>
            <View
              style={[
                styles.smallIconCircle,
                styles.smallIconBottomLeft,
                { backgroundColor: '#8B5CF6' },
              ]}
            >
              <Sparkle size={24} color="#FFFFFF" weight="fill" />
            </View>
          </View>
        );

      default:
        return (
          <View style={[styles.iconCircle, { backgroundColor: accentColor }]}>
            <Sparkle size={48} color="#FFFFFF" weight="fill" />
          </View>
        );
    }
  };

  return (
    <Animated.View
      style={[
        styles.illustrationContainer,
        {
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      {renderIcons()}
    </Animated.View>
  );
};

// ============================================================================
// Main Component
// ============================================================================

export function WelcomeCarousel({ onComplete }: WelcomeCarouselProps) {
  const { isDark, colors } = useTheme();
  const [slides, setSlides] = useState<CarouselSlide[]>(DEFAULT_CAROUSEL_SLIDES);

  // Load remote config
  useEffect(() => {
    getOnboardingConfig().then((config) => {
      if (config.carousel.slides.length > 0) {
        setSlides(config.carousel.slides);
      }
    });
  }, []);

  // Build pages for onboarding component
  const pages = slides.map((slide) => ({
    backgroundColor: slide.backgroundColor,
    image: (
      <SlideIllustration slideId={slide.id} accentColor={slide.accentColor} />
    ),
    title: slide.title,
    subtitle: slide.subtitle,
    titleStyles: styles.title,
    subTitleStyles: styles.subtitle,
  }));

  return (
    <SafeAreaView style={styles.container}>
      <Onboarding
        pages={pages}
        onDone={onComplete}
        onSkip={onComplete}
        showSkip={true}
        showNext={true}
        showDone={true}
        bottomBarHighlight={false}
        containerStyles={styles.pageContainer}
        imageContainerStyles={styles.imageContainer}
        titleStyles={styles.title}
        subTitleStyles={styles.subtitle}
        DotComponent={({ selected }) => (
          <Dot
            selected={selected}
            isLight={slides[0]?.backgroundColor === '#FFFFFF'}
          />
        )}
        SkipButtonComponent={({ onPress }) => (
          <SkipButton
            onPress={onPress}
            isLight={slides[0]?.backgroundColor === '#FFFFFF'}
          />
        )}
        NextButtonComponent={({ onPress }) => (
          <NextButton
            onPress={onPress}
            isLight={slides[0]?.backgroundColor === '#FFFFFF'}
          />
        )}
        DoneButtonComponent={({ onPress }) => <DoneButton onPress={onPress} />}
      />
    </SafeAreaView>
  );
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  pageContainer: {
    paddingHorizontal: 24,
  },
  imageContainer: {
    paddingBottom: 32,
  },

  // Illustration
  illustrationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  iconCluster: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: 160,
    height: 160,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  smallIconCircle: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  smallIconTopRight: {
    top: 0,
    right: 0,
  },
  smallIconBottomLeft: {
    bottom: 0,
    left: 0,
  },

  // Typography
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1C1917',
    textAlign: 'center',
    marginBottom: 12,
    fontFamily: 'Inter_700Bold',
  },
  subtitle: {
    fontSize: 16,
    color: '#78716C',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 24,
    fontFamily: 'Inter_400Regular',
  },

  // Dots
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },

  // Skip Button
  skipButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  skipText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: 'Inter_500Medium',
  },
  skipTextDark: {
    color: '#78716C',
  },

  // Next Button
  nextButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  nextButtonDark: {
    backgroundColor: '#4C9C9B',
  },
  nextText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  nextTextDark: {
    color: '#FFFFFF',
  },

  // Done Button
  doneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#4C9C9B',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 28,
    shadowColor: '#4C9C9B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  doneText: {
    fontSize: 17,
    color: '#FFFFFF',
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
});

export default WelcomeCarousel;

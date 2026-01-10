declare module 'react-native-onboarding-swiper' {
  import { ComponentType, ReactNode } from 'react';
  import { StyleProp, ViewStyle, TextStyle, ImageSourcePropType } from 'react-native';

  interface OnboardingPage {
    backgroundColor: string;
    image: ReactNode;
    title: string | ReactNode;
    subtitle: string | ReactNode;
    titleStyles?: StyleProp<TextStyle>;
    subTitleStyles?: StyleProp<TextStyle>;
  }

  interface OnboardingProps {
    pages: OnboardingPage[];
    onSkip?: () => void;
    onDone?: () => void;
    showSkip?: boolean;
    showNext?: boolean;
    showDone?: boolean;
    bottomBarHighlight?: boolean;
    bottomBarHeight?: number;
    bottomBarColor?: string;
    controlStatusBar?: boolean;
    transitionAnimationDuration?: number;
    skipToPage?: number;
    pageIndexCallback?: (pageIndex: number) => void;
    containerStyles?: StyleProp<ViewStyle>;
    imageContainerStyles?: StyleProp<ViewStyle>;
    titleStyles?: StyleProp<TextStyle>;
    subTitleStyles?: StyleProp<TextStyle>;
    DotComponent?: ComponentType<{ selected: boolean; isLight?: boolean }>;
    SkipButtonComponent?: ComponentType<{ onPress: () => void; isLight?: boolean }>;
    NextButtonComponent?: ComponentType<{ onPress: () => void; isLight?: boolean }>;
    DoneButtonComponent?: ComponentType<{ onPress: () => void; isLight?: boolean }>;
    allowFontScaling?: boolean;
    flatlistProps?: Record<string, unknown>;
  }

  const Onboarding: ComponentType<OnboardingProps>;
  export default Onboarding;
}

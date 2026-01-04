import '../global.css';

import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, createContext, useContext, useState } from 'react';
import 'react-native-reanimated';

// Onboarding imports
import { useUserStore } from '@/stores';
import { useAuthStore } from '@/stores/authStore';
import { WelcomeCarousel, CoachMarksProvider } from '@/components/onboarding';
import { isSupabaseConfigured } from '@/services/supabase';
import { View, ActivityIndicator } from 'react-native';
import { Redirect, useSegments, useRootNavigationState } from 'expo-router';

// Google Fonts imports - Sans-serif
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
} from '@expo-google-fonts/poppins';
import {
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
} from '@expo-google-fonts/nunito';

// Google Fonts imports - Serif
import {
  PlayfairDisplay_400Regular,
  PlayfairDisplay_600SemiBold,
  PlayfairDisplay_700Bold,
} from '@expo-google-fonts/playfair-display';
import {
  Lora_400Regular,
  Lora_500Medium,
  Lora_600SemiBold,
} from '@expo-google-fonts/lora';
import {
  Merriweather_400Regular,
  Merriweather_700Bold,
} from '@expo-google-fonts/merriweather';

// Google Fonts imports - Display
import {
  Outfit_500Medium,
  Outfit_600SemiBold,
  Outfit_700Bold,
} from '@expo-google-fonts/outfit';
import { BebasNeue_400Regular } from '@expo-google-fonts/bebas-neue';
import { Righteous_400Regular } from '@expo-google-fonts/righteous';

// Google Fonts imports - Handwritten
import {
  Caveat_400Regular,
  Caveat_500Medium,
  Caveat_700Bold,
} from '@expo-google-fonts/caveat';
import {
  DancingScript_400Regular,
  DancingScript_500Medium,
  DancingScript_700Bold,
} from '@expo-google-fonts/dancing-script';
import { Pacifico_400Regular } from '@expo-google-fonts/pacifico';
import { IndieFlower_400Regular } from '@expo-google-fonts/indie-flower';

// Google Fonts imports - Mono
import {
  JetBrainsMono_400Regular,
  JetBrainsMono_500Medium,
} from '@expo-google-fonts/jetbrains-mono';
import {
  FiraCode_400Regular,
  FiraCode_500Medium,
} from '@expo-google-fonts/fira-code';

import { useColorScheme } from '@/components/useColorScheme';
import { purchaseService } from '@/services/purchaseService';
import { initSentry } from '@/services/sentry';
import { initFirebase, trackScreen } from '@/services/firebaseAnalytics';
import { usePathname } from 'expo-router';

// Initialize Sentry for error monitoring (kept as fallback)
initSentry();

// Custom error boundary with ToonNotes styling
export { ErrorBoundary } from '@/components/ErrorBoundary';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

// Create context for font loading state
const FontLoadingContext = createContext<boolean>(false);

/**
 * Hook to check if fonts are loaded.
 * Use this in components to conditionally apply Google Fonts.
 */
export const useFontsLoaded = () => useContext(FontLoadingContext);

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    // Legacy fonts
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,

    // Sans-serif
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,

    // Serif
    PlayfairDisplay_400Regular,
    PlayfairDisplay_600SemiBold,
    PlayfairDisplay_700Bold,
    Lora_400Regular,
    Lora_500Medium,
    Lora_600SemiBold,
    Merriweather_400Regular,
    Merriweather_700Bold,

    // Display
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
    BebasNeue_400Regular,
    Righteous_400Regular,

    // Handwritten
    Caveat_400Regular,
    Caveat_500Medium,
    Caveat_700Bold,
    DancingScript_400Regular,
    DancingScript_500Medium,
    DancingScript_700Bold,
    Pacifico_400Regular,
    IndieFlower_400Regular,

    // Mono
    JetBrainsMono_400Regular,
    JetBrainsMono_500Medium,
    FiraCode_400Regular,
    FiraCode_500Medium,
  });

  useEffect(() => {
    if (error) {
      console.error('Font loading error:', error);
    }
  }, [error]);

  useEffect(() => {
    if (loaded) {
      console.log('Fonts loaded, hiding splash screen');
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  // Always hide splash after a timeout as fallback
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log('Fallback: hiding splash screen after timeout');
      SplashScreen.hideAsync();
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // Initialize RevenueCat for in-app purchases
  useEffect(() => {
    purchaseService.initialize().catch((error) => {
      console.error('Failed to initialize RevenueCat:', error);
    });
  }, []);

  // Initialize Firebase Analytics & Crashlytics
  useEffect(() => {
    initFirebase();
  }, []);

  if (!loaded && !error) {
    // Return a simple loading view instead of null
    return null;
  }

  return (
    <FontLoadingContext.Provider value={loaded}>
      <RootLayoutNav />
    </FontLoadingContext.Provider>
  );
}

/**
 * Navigation tracker component for Firebase Analytics screen views.
 * Tracks screen changes automatically using Expo Router's usePathname.
 */
function NavigationTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;

    // Convert pathname to readable screen name
    // "/" -> "Home", "/note/123" -> "note_123", "/design/create" -> "design_create"
    const screenName = pathname === '/'
      ? 'Home'
      : pathname.replace(/^\//, '').replace(/\//g, '_');

    trackScreen(screenName);
  }, [pathname]);

  return null;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { onboarding, completeWelcome } = useUserStore();
  const { isInitialized, user, initialize } = useAuthStore();
  const [showOnboarding, setShowOnboarding] = useState(!onboarding.hasCompletedWelcome);
  const segments = useSegments();
  const navigationState = useRootNavigationState();

  // Initialize auth on mount (only if Supabase is configured)
  useEffect(() => {
    if (isSupabaseConfigured()) {
      initialize();
    }
  }, []);

  // Handle onboarding completion
  const handleOnboardingComplete = () => {
    completeWelcome();
    setShowOnboarding(false);
  };

  // Check if we're on an auth route
  const inAuthGroup = segments[0] === 'auth';

  // Wait for navigation to be ready
  if (!navigationState?.key) {
    return null;
  }

  // Show loading while auth initializes (only if Supabase is configured)
  if (isSupabaseConfigured() && !isInitialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colorScheme === 'dark' ? '#000' : '#fff' }}>
        <ActivityIndicator size="large" color={colorScheme === 'dark' ? '#fff' : '#000'} />
      </View>
    );
  }

  // Redirect to auth if not authenticated and not already on auth screen
  if (isSupabaseConfigured() && !user && !inAuthGroup) {
    return <Redirect href="/auth" />;
  }

  // Redirect to main app if authenticated and on auth screen
  if (isSupabaseConfigured() && user && inAuthGroup) {
    return <Redirect href="/(tabs)" />;
  }

  // Show welcome carousel if user hasn't completed onboarding
  if (showOnboarding) {
    return (
      <>
        <StatusBar style="dark" />
        <WelcomeCarousel onComplete={handleOnboardingComplete} />
      </>
    );
  }

  return (
    <>
      <NavigationTracker />
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <CoachMarksProvider>
          <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="auth" options={{ headerShown: false }} />
          <Stack.Screen
            name="note/[id]"
            options={{
              presentation: 'modal',
              headerShown: false,
              gestureEnabled: true,
              fullScreenGestureEnabled: true,
            }}
          />
          <Stack.Screen
            name="design/create"
            options={{
              presentation: 'modal',
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="board/[hashtag]"
            options={{
              presentation: 'modal',
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="archive"
            options={{
              presentation: 'modal',
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="trash"
            options={{
              presentation: 'modal',
              headerShown: false,
            }}
          />
          </Stack>
        </CoachMarksProvider>
      </ThemeProvider>
    </>
  );
}

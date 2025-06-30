import { AlertProvider } from '@/components/ui/AlertProvider';
import { NotificationProvider } from '@/components/ui/NotificationProvider';
import { ConvexQuestProvider } from '@/contexts/ConvexQuestContext';
import { ThemeProvider, useColorScheme } from '@/hooks/useColorScheme';
import { ClerkProvider, useAuth } from '@clerk/clerk-expo';
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_700Bold,
} from '@expo-google-fonts/dm-sans';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from '@expo-google-fonts/inter';
import { ConvexProviderWithClerk } from 'convex/react-clerk';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { convex } from '@/lib/convex';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';

const tokenCache = {
  async getToken(key: string) {
    try {
      return SecureStore.getItemAsync(key);
    } catch (err) {
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      return SecureStore.setItemAsync(key, value);
    } catch (err) {
      return;
    }
  },
};

// Keep the splash screen visible until we're ready to render
SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  return (
    <AlertProvider>
      <ConvexQuestProvider>
        <NotificationProvider>
          <Stack
            screenOptions={{
              headerShown: false,
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(onboarding)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="help" />
            <Stack.Screen name="+not-found" />
          </Stack>
        </NotificationProvider>
      </ConvexQuestProvider>
    </AlertProvider>
  );
}

function StatusBarWrapper() {
  const { colorScheme } = useColorScheme();

  return <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />;
}

export default function RootLayout() {
  useFrameworkReady();
  
  const [fontsLoaded, fontError] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  useEffect(() => {
    if (fontError) throw fontError;
  }, [fontError]);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      // Only hide the splash screen once the fonts are loaded or if there's an error
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      onLayoutRootView();
    }
  }, [fontsLoaded, fontError, onLayoutRootView]);

  // Don't render anything until the fonts are loaded or there's an error
  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <ClerkProvider
      tokenCache={tokenCache}
      publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!}
    >
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <ThemeProvider>
          <SafeAreaProvider>
            <StatusBarWrapper />
            <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutRootView}>
              <RootLayoutNav />
            </GestureHandlerRootView>
          </SafeAreaProvider>
        </ThemeProvider>
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
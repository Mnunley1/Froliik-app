import { AppText } from '@/components/ui/Typography';
import { Spacing } from '@/constants/colors';
import { useThemeColors } from '@/hooks/useColorScheme';
import { useConvexAuth, useQuery } from 'convex/react';
import { useRouter } from 'expo-router';
import { Sparkles } from 'lucide-react-native';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '../convex/_generated/api';

export default function Index() {
  const router = useRouter();
  const { isLoading, isAuthenticated } = useConvexAuth();
  const currentUser = useQuery(api.users.current);
  const colors = useThemeColors();

  useEffect(() => {
    // Wait for auth to be fully loaded
    if (isLoading) return;

    // If not authenticated, go to login
    if (!isAuthenticated) {
      console.log('User not authenticated, redirecting to login');
      router.replace('/(auth)/login');
      return;
    }

    // If authenticated but onboarding not completed, go to onboarding
    if (currentUser && currentUser.onboardingCompleted === false) {
      console.log(
        'User authenticated but onboarding not completed, redirecting to onboarding',
      );
      router.replace('/(onboarding)');
      return;
    }

    // If authenticated and onboarding completed, go to main app
    if (
      isAuthenticated &&
      currentUser &&
      currentUser.onboardingCompleted === true
    ) {
      console.log(
        'User authenticated and onboarding completed, redirecting to main app',
      );
      router.replace('/(tabs)');
      return;
    }

    // If user data is still loading, wait
    if (currentUser === undefined) {
      console.log('User data still loading, waiting...');
      return;
    }
  }, [isLoading, isAuthenticated, currentUser, router]);

  // Show loading screen while auth is initializing
  if (isLoading || (isAuthenticated && currentUser === undefined)) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <Sparkles size={48} color={colors.primary} strokeWidth={1.5} />
        <AppText variant="h1" style={styles.title}>
          Froliik
        </AppText>
        <AppText variant="body" color="secondary" style={styles.subtitle}>
          Loading your journey...
        </AppText>
      </SafeAreaView>
    );
  }

  // Return null after navigation is triggered
  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  title: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    textAlign: 'center',
  },
});

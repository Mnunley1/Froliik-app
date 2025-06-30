import { Button } from '@/components/ui/Button';
import { AppText } from '@/components/ui/Typography';
import { BorderRadius, Spacing } from '@/constants/colors';
import { useThemeColors } from '@/hooks/useColorScheme';
import { useQuery } from 'convex/react';
import { router } from 'expo-router';
import { Sparkles, Target, Trophy, Users } from 'lucide-react-native';
import { ActivityIndicator, Dimensions, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '../../convex/_generated/api';

const { height } = Dimensions.get('window');

export default function OnboardingIndex() {
  const colors = useThemeColors();
  const currentUser = useQuery(api.users.current);
  const userSettings = useQuery(
    api.userSettings.getUserSettings,
    currentUser ? { userId: currentUser._id } : 'skip',
  );

  // Show loading while we check user status
  if (currentUser === undefined || userSettings === undefined) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: colors.background },
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // If user doesn't exist, redirect to auth
  if (!currentUser) {
    router.replace('/(auth)/login');
    return null;
  }

  // If onboarding is completed, redirect to main app
  if (currentUser.onboardingCompleted) {
    router.replace('/(tabs)');
    return null;
  }

  // Show welcome screen
  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.content}>
        {/* Hero Section */}
        <View style={styles.hero}>
          <View
            style={[styles.iconContainer, { backgroundColor: colors.surface }]}
          >
            <Sparkles size={64} color={colors.primary} strokeWidth={2} />
          </View>

          <AppText variant="h1" align="center" style={styles.title}>
            Welcome to Froliik
          </AppText>

          <AppText
            variant="body"
            color="secondary"
            align="center"
            style={styles.subtitle}
          >
            Your AI-powered companion for personal growth and meaningful quests
          </AppText>
        </View>

        {/* Features Section */}
        <View style={styles.features}>
          <FeatureItem
            icon={Target}
            title="Personalized Quests"
            description="AI-generated challenges tailored to your interests and goals"
            color="#3b82f6"
          />
          <FeatureItem
            icon={Users}
            title="Community Connection"
            description="Connect with like-minded people on similar journeys"
            color="#ec4899"
          />
          <FeatureItem
            icon={Trophy}
            title="Track Progress"
            description="Celebrate achievements and see your growth over time"
            color="#fbbf24"
          />
        </View>

        {/* CTA Section */}
        <View style={styles.cta}>
          <Button
            title="Get Started"
            onPress={() => router.push('/(onboarding)/step-1')}
            style={styles.ctaButton}
          />

          <AppText
            variant="caption"
            color="muted"
            align="center"
            style={styles.ctaSubtext}
          >
            Takes just 2 minutes to set up your personalized experience
          </AppText>
        </View>
      </View>
    </SafeAreaView>
  );
}

function FeatureItem({
  icon: Icon,
  title,
  description,
  color,
}: {
  icon: any;
  title: string;
  description: string;
  color: string;
}) {
  const colors = useThemeColors();

  return (
    <View style={styles.featureItem}>
      <View style={[styles.featureIcon, { backgroundColor: colors.surface }]}>
        <Icon size={24} color={color} strokeWidth={2} />
      </View>
      <View style={styles.featureContent}>
        <AppText variant="h3" style={styles.featureTitle}>
          {title}
        </AppText>
        <AppText
          variant="body"
          color="secondary"
          style={styles.featureDescription}
        >
          {description}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    justifyContent: 'space-between',
  },
  hero: {
    alignItems: 'center',
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.xxxl,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  title: {
    marginBottom: Spacing.sm,
  },
  subtitle: {
    maxWidth: 320,
    lineHeight: 24,
  },
  features: {
    gap: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    marginBottom: Spacing.xs,
  },
  featureDescription: {
    lineHeight: 20,
  },
  cta: {
    alignItems: 'center',
    paddingBottom: Spacing.xl,
  },
  ctaButton: {
    minWidth: 200,
    marginBottom: Spacing.md,
  },
  ctaSubtext: {
    maxWidth: 280,
  },
});

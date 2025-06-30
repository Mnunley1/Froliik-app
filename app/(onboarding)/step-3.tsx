import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { OnboardingProgress } from '@/components/ui/OnboardingProgress';
import { AppText } from '@/components/ui/Typography';
import { BorderRadius, Spacing } from '@/constants/colors';
import { useThemeColors } from '@/hooks/useColorScheme';
import { useQuestGeneration } from '@/hooks/useQuestGeneration';
import { useAuth } from '@clerk/clerk-expo';
import { useMutation, useQuery } from 'convex/react';
import { router } from 'expo-router';
import { ArrowLeft, CheckCircle } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '../../convex/_generated/api';

export default function Step3Screen() {
  const colors = useThemeColors();
  const { signOut } = useAuth();
  const currentUser = useQuery(api.users.current);
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { generateFirstQuest } = useQuestGeneration();

  const markOnboardingCompleted = useMutation(
    api.users.markOnboardingCompleted,
  );
  const updateOnboardingStep = useMutation(
    api.userSettings.updateOnboardingStep,
  );
  const updateQuestPreferences = useMutation(
    api.userSettings.updateQuestPreferences,
  );

  const handleComplete = async () => {
    if (!currentUser?._id) return;

    setIsLoading(true);
    try {
      // Save name and mark step 3 complete
      await updateOnboardingStep({
        userId: currentUser._id,
        step: 'step3',
        data: { fullName: fullName.trim() },
      });

      // Mark onboarding as completed
      await markOnboardingCompleted({ userId: currentUser._id });

      // Enable quest generation
      await updateQuestPreferences({
        userId: currentUser._id,
        questPreferences: {
          autoGenerateQuests: true,
          paused: false,
        },
      });

      // Generate the first quest for the user
      try {
        const questResult = await generateFirstQuest(currentUser._id);
        if (questResult.success) {
          console.log(
            '✅ First quest generated successfully:',
            questResult.questId,
          );
        } else {
          console.warn('⚠️ First quest generation failed:', questResult.error);
        }
      } catch (questError) {
        console.error('Error generating first quest:', questError);
        // Continue anyway to avoid blocking the user
      }

      console.log('✅ Onboarding completed successfully');
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      // Continue anyway to avoid blocking the user
      router.replace('/(tabs)');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Progress Indicator */}
          <OnboardingProgress
            currentStep={3}
            totalSteps={3}
            style={styles.progress}
          />

          {/* Header Section */}
          <View style={styles.header}>
            <Button
              title=""
              variant="ghost"
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <ArrowLeft size={24} color={colors.text.primary} />
            </Button>
          </View>

          <View style={styles.content}>
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: colors.surface },
              ]}
            >
              <CheckCircle size={48} color={colors.primary} strokeWidth={2} />
            </View>

            <AppText variant="h1" align="center" style={styles.title}>
              You're Almost There!
            </AppText>

            <AppText
              variant="body"
              color="secondary"
              align="center"
              style={styles.subtitle}
            >
              Just one more step to complete your setup and start your journey.
            </AppText>

            {/* Name Input */}
            <Card style={styles.nameCard}>
              <AppText variant="h3" style={styles.cardTitle}>
                What should we call you?
              </AppText>
              <AppText
                variant="body"
                color="secondary"
                style={styles.cardSubtitle}
              >
                Enter your name so we can personalize your experience.
              </AppText>

              <TextInput
                style={[
                  styles.nameInput,
                  {
                    borderColor: colors.border,
                    color: colors.text.primary,
                    backgroundColor: colors.surface,
                  },
                ]}
                placeholder="Enter your name"
                placeholderTextColor={colors.text.secondary}
                value={fullName}
                onChangeText={setFullName}
                autoFocus
                autoCapitalize="words"
                autoCorrect={false}
                returnKeyType="done"
                blurOnSubmit={true}
              />
            </Card>

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              <Button
                title={isLoading ? 'Setting Up...' : 'Start Exploring'}
                onPress={handleComplete}
                disabled={!fullName.trim() || isLoading}
                style={styles.primaryButton}
              />

              <Button
                title="Sign Out"
                onPress={handleSignOut}
                variant="outline"
                style={styles.signOutButton}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  progress: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  backButton: {
    alignSelf: 'flex-start',
    minHeight: 'auto',
    paddingHorizontal: 0,
    paddingVertical: Spacing.sm,
    shadowOpacity: 0,
    elevation: 0,
    backgroundColor: 'transparent',
  },
  content: {
    flex: 1,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
    alignSelf: 'center',
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
    marginBottom: Spacing.xxl,
    lineHeight: 24,
    maxWidth: 320,
  },
  nameCard: {
    marginBottom: Spacing.xl,
  },
  cardTitle: {
    marginBottom: Spacing.xs,
  },
  cardSubtitle: {
    marginBottom: Spacing.lg,
  },
  nameInput: {
    borderWidth: 1.5,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  buttonContainer: {
    alignItems: 'center',
    gap: Spacing.md,
  },
  primaryButton: {
    minWidth: 200,
  },
  signOutButton: {
    minWidth: 200,
  },
});

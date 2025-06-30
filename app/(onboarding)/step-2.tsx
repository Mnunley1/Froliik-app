import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { OnboardingProgress } from '@/components/ui/OnboardingProgress';
import { AppText } from '@/components/ui/Typography';
import { BorderRadius, Spacing } from '@/constants/colors';
import { useThemeColors } from '@/hooks/useColorScheme';
import { useMutation, useQuery } from 'convex/react';
import { router } from 'expo-router';
import { Sparkles } from 'lucide-react-native';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '../../convex/_generated/api';

export default function Step2Screen() {
  const colors = useThemeColors();
  const currentUser = useQuery(api.users.current);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const updateOnboardingStep = useMutation(
    api.userSettings.updateOnboardingStep,
  );

  const levels = [
    {
      id: 'gentle',
      label: 'Gentle',
      description: 'Low-pressure, supportive quests to ease you in.',
    },
    {
      id: 'balanced',
      label: 'Balanced',
      description: 'A mix of comfort and challenge for steady growth.',
    },
    {
      id: 'adventurous',
      label: 'Adventurous',
      description: 'Bold, exciting quests to push your boundaries.',
    },
  ];

  const handleContinue = async () => {
    if (!currentUser?._id || !selectedLevel) return;
    setIsSaving(true);
    try {
      await updateOnboardingStep({
        userId: currentUser._id,
        step: 'step2',
        data: { questLevel: selectedLevel },
      });
      router.push('step-3');
    } catch (error) {
      router.push('step-3');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <OnboardingProgress
          currentStep={2}
          totalSteps={3}
          style={styles.progress}
        />
        <View style={styles.header}>
          <View
            style={[styles.iconContainer, { backgroundColor: colors.surface }]}
          >
            <Sparkles size={48} color={colors.primary} strokeWidth={2} />
          </View>
          <AppText variant="h1" align="center" style={styles.title}>
            Choose Your Quest Level
          </AppText>
          <AppText
            variant="body"
            color="secondary"
            align="center"
            style={styles.subtitle}
          >
            How adventurous do you want your quests to be?
          </AppText>
        </View>
        <Card style={styles.levelsCard}>
          {levels.map((level) => (
            <TouchableOpacity
              key={level.id}
              style={[
                styles.levelItem,
                selectedLevel === level.id && {
                  borderColor: colors.primary,
                  borderWidth: 2,
                  backgroundColor: colors.primary + '10',
                },
              ]}
              onPress={() => setSelectedLevel(level.id)}
              activeOpacity={0.8}
            >
              <AppText variant="h3" style={styles.levelLabel}>
                {level.label}
              </AppText>
              <AppText
                variant="body"
                color="secondary"
                style={styles.levelDescription}
              >
                {level.description}
              </AppText>
            </TouchableOpacity>
          ))}
        </Card>
        <View style={styles.buttonContainer}>
          <Button
            title={isSaving ? 'Saving...' : 'Continue'}
            onPress={handleContinue}
            disabled={!selectedLevel || isSaving}
            style={styles.continueButton}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
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
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  title: {
    marginBottom: Spacing.sm,
  },
  subtitle: {
    marginBottom: Spacing.xl,
    lineHeight: 22,
    maxWidth: 320,
  },
  levelsCard: {
    marginBottom: Spacing.xl,
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
  },
  levelItem: {
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    backgroundColor: '#fff',
  },
  levelLabel: {
    marginBottom: Spacing.xs,
  },
  levelDescription: {
    marginBottom: 0,
  },
  buttonContainer: {
    alignItems: 'center',
  },
  continueButton: {
    minWidth: 200,
  },
});

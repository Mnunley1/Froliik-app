import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { OnboardingProgress } from '@/components/ui/OnboardingProgress';
import { AppText } from '@/components/ui/Typography';
import { BorderRadius, Spacing } from '@/constants/colors';
import { useThemeColors } from '@/hooks/useColorScheme';
import { useMutation, useQuery } from 'convex/react';
import { router } from 'expo-router';
import {
  ArrowRight,
  BookOpen,
  Compass,
  Heart,
  Palette,
  Sparkles,
  Target,
  TrendingUp,
  Users,
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '../../convex/_generated/api';

export default function Step1Screen() {
  const colors = useThemeColors();
  const currentUser = useQuery(api.users.current);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const updateOnboardingStep = useMutation(
    api.userSettings.updateOnboardingStep,
  );

  const interests = [
    { id: 'mindfulness', label: 'Mindfulness', icon: Heart, color: '#ef4444' },
    {
      id: 'productivity',
      label: 'Productivity',
      icon: Target,
      color: '#3b82f6',
    },
    { id: 'health', label: 'Health & Wellness', icon: Heart, color: '#10b981' },
    { id: 'learning', label: 'Learning', icon: BookOpen, color: '#8b5cf6' },
    { id: 'creativity', label: 'Creativity', icon: Palette, color: '#f59e0b' },
    { id: 'social', label: 'Social Connection', icon: Users, color: '#ec4899' },
    {
      id: 'growth',
      label: 'Personal Growth',
      icon: TrendingUp,
      color: '#06b6d4',
    },
    { id: 'adventure', label: 'Adventure', icon: Compass, color: '#84cc16' },
  ];

  const toggleInterest = (interestId: string) => {
    setSelectedInterests((prev) => {
      if (prev.includes(interestId)) {
        // If already selected, remove it
        return prev.filter((i) => i !== interestId);
      } else {
        // If not selected, only add if under 3 selections
        if (prev.length < 3) {
          return [...prev, interestId];
        }
        // If already at 3, don't add (could show a toast/alert here)
        return prev;
      }
    });
  };

  const handleContinue = async () => {
    if (!currentUser?._id || selectedInterests.length === 0) return;

    setIsSaving(true);
    try {
      // Save interests to user settings
      await updateOnboardingStep({
        userId: currentUser._id,
        step: 'step1',
        data: { interests: selectedInterests },
      });

      console.log('✅ Step 1 completed, interests saved');
      router.push('step-2');
    } catch (error) {
      console.error('❌ Error saving step 1:', error);
      // Continue anyway to avoid blocking the user
      router.push('step-2');
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
        {/* Progress Indicator */}
        <OnboardingProgress
          currentStep={1}
          totalSteps={3}
          style={styles.progress}
        />

        {/* Header Section */}
        <View style={styles.header}>
          <View
            style={[styles.iconContainer, { backgroundColor: colors.surface }]}
          >
            <Sparkles size={48} color={colors.primary} strokeWidth={2} />
          </View>

          <AppText variant="h1" align="center" style={styles.title}>
            Welcome to Froliik!
          </AppText>

          <AppText
            variant="body"
            color="secondary"
            align="center"
            style={styles.subtitle}
          >
            Let's personalize your experience by learning about your interests.
          </AppText>
        </View>

        {/* Interests Selection */}
        <Card style={styles.interestsCard}>
          <AppText variant="h3" style={styles.cardTitle}>
            What interests you most?
          </AppText>
          <AppText variant="body" color="secondary" style={styles.cardSubtitle}>
            Select up to 3 interests to help us create meaningful quests for
            you.
          </AppText>

          <View style={styles.selectionCounter}>
            <AppText variant="caption" color="secondary">
              {selectedInterests.length}/3 selected
            </AppText>
          </View>

          <View style={styles.interestsGrid}>
            {interests.map((interest) => {
              const IconComponent = interest.icon;
              const isSelected = selectedInterests.includes(interest.id);
              const isDisabled = !isSelected && selectedInterests.length >= 3;

              return (
                <TouchableOpacity
                  key={interest.id}
                  style={[
                    styles.interestItem,
                    {
                      backgroundColor: isDisabled
                        ? colors.background
                        : colors.surface,
                      borderColor: isSelected
                        ? interest.color
                        : isDisabled
                          ? colors.border
                          : colors.border,
                      borderWidth: isSelected ? 2 : 1.5,
                      shadowColor: '#000',
                      shadowOpacity: isDisabled ? 0.02 : 0.05,
                      shadowRadius: 4,
                      elevation: isDisabled ? 1 : 2,
                      opacity: isDisabled ? 0.5 : 1,
                    },
                  ]}
                  onPress={() => toggleInterest(interest.id)}
                  activeOpacity={isDisabled ? 1 : 0.8}
                  disabled={isDisabled}
                >
                  <View
                    style={[
                      styles.interestIcon,
                      {
                        backgroundColor: isDisabled
                          ? colors.background
                          : `${interest.color}15`,
                        borderColor: isDisabled
                          ? colors.border
                          : `${interest.color}30`,
                      },
                    ]}
                  >
                    <IconComponent
                      size={20}
                      color={isDisabled ? colors.text.muted : interest.color}
                      strokeWidth={2}
                    />
                  </View>
                  <View style={styles.interestContent}>
                    <Text
                      style={{
                        fontFamily: 'Inter-Medium',
                        fontWeight: '500',
                        color: isDisabled
                          ? colors.text.muted
                          : colors.text.primary,
                        marginBottom: 2,
                        fontSize: 13,
                        lineHeight: 16,
                        flexShrink: 1,
                      }}
                      numberOfLines={2}
                    >
                      {interest.label}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>

        {/* Continue Button */}
        <View style={styles.buttonContainer}>
          <Button
            title={
              isSaving
                ? 'Saving...'
                : selectedInterests.length === 0
                  ? 'Select at least 1 interest'
                  : 'Continue'
            }
            onPress={handleContinue}
            disabled={selectedInterests.length === 0 || isSaving}
            style={styles.continueButton}
          >
            <ArrowRight size={20} color={colors.text.inverse} />
          </Button>
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
    marginBottom: Spacing.xxl,
  },
  iconContainer: {
    width: 96,
    height: 96,
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
  interestsCard: {
    marginBottom: Spacing.xl,
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  cardTitle: {
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  cardSubtitle: {
    marginBottom: Spacing.xl,
    textAlign: 'center',
    lineHeight: 22,
  },
  selectionCounter: {
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  interestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    justifyContent: 'space-between',
  },
  interestItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    width: '48.5%',
    gap: Spacing.xs,
    minHeight: 70,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },
  interestIcon: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    flexShrink: 0,
  },
  interestContent: {
    flex: 1,
    flexShrink: 1,
  },
  buttonContainer: {
    alignItems: 'center',
  },
  continueButton: {
    minWidth: 200,
  },
});

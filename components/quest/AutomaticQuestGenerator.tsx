import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { AppText } from '@/components/ui/Typography';
import { Spacing } from '@/constants/colors';
import { useThemeColors } from '@/hooks/useColorScheme';
import { useQuestGeneration } from '@/hooks/useQuestGeneration';
import { useQuery } from 'convex/react';
import { CheckCircle, Clock, Sparkles, Wand2 } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { api } from '../../convex/_generated/api';

/**
 * Automatic Quest Generator Component
 *
 * This component handles automatic quest generation based on user preferences and timing.
 * It monitors app state changes and generates quests when appropriate.
 */
export function AutomaticQuestGenerator() {
  const colors = useThemeColors();
  const currentUser = useQuery(api.users.current);
  const { generateQuest, isGenerating } = useQuestGeneration();
  const [generatedQuest, setGeneratedQuest] = useState<any>(null);
  const [lastGenerationTime, setLastGenerationTime] = useState<number | null>(
    null,
  );

  // Check if user has active quests
  const activeQuests = useQuery(
    api.quests.getActiveSideQuests,
    currentUser?._id ? { userId: currentUser._id } : 'skip',
  );

  // Check user settings for quest preferences
  const userSettings = useQuery(
    api.userSettings.getUserSettings,
    currentUser?._id ? { userId: currentUser._id } : 'skip',
  );

  // Check if we should generate a new quest
  const shouldGenerateQuest = () => {
    if (!currentUser?._id || !userSettings) return false;

    // Check if quest generation is paused
    if (userSettings.questPreferences?.paused) return false;

    // Check if auto-generation is enabled
    if (!userSettings.questPreferences?.autoGenerateQuests) return false;

    // Check if user has completed onboarding
    if (!currentUser.onboardingCompleted) return false;

    // Check if user has no active quests
    if (activeQuests && activeQuests.length > 0) return false;

    // Check generation frequency (for now, allow manual generation)
    return true;
  };

  const handleGenerateQuest = async () => {
    if (!currentUser?._id) {
      console.error('No user ID available for quest generation');
      return;
    }

    try {
      const result = await generateQuest({ userId: currentUser._id });

      if (result.success) {
        setGeneratedQuest(result);
        setLastGenerationTime(Date.now());
        console.log('✅ Quest generated successfully:', result.questId);
      } else {
        console.error('Failed to generate quest:', result.error);
      }
    } catch (error) {
      console.error('Error generating quest:', error);
    }
  };

  // Auto-generate quest when conditions are met
  useEffect(() => {
    if (shouldGenerateQuest() && !isGenerating) {
      console.log('🔄 Auto-generating quest...');
      handleGenerateQuest();
    }
  }, [currentUser, userSettings, activeQuests, isGenerating]);

  // Don't render if user hasn't completed onboarding
  if (!currentUser?.onboardingCompleted) {
    return null;
  }

  // Don't render if quest generation is disabled
  if (userSettings?.questPreferences?.paused) {
    return null;
  }

  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Wand2 size={24} color={colors.primary} />
        </View>
        <View style={styles.titleContainer}>
          <AppText variant="h3">AI Quest Generator</AppText>
          <AppText variant="body" color="secondary">
            {activeQuests && activeQuests.length > 0
              ? `You have ${activeQuests.length} active quest${activeQuests.length > 1 ? 's' : ''}`
              : 'Ready to create your next adventure'}
          </AppText>
        </View>
      </View>

      {activeQuests && activeQuests.length === 0 && (
        <Button
          title={isGenerating ? 'Generating...' : 'Generate New Quest'}
          onPress={handleGenerateQuest}
          disabled={isGenerating || !currentUser?._id}
          style={styles.generateButton}
        >
          <Sparkles size={20} color={colors.background} />
        </Button>
      )}

      {activeQuests && activeQuests.length > 0 && (
        <View style={styles.statusContainer}>
          <View style={styles.statusItem}>
            <CheckCircle size={16} color={colors.success} />
            <AppText variant="body" color="secondary" style={styles.statusText}>
              {activeQuests.length} quest{activeQuests.length > 1 ? 's' : ''}{' '}
              active
            </AppText>
          </View>
          {lastGenerationTime && (
            <View style={styles.statusItem}>
              <Clock size={16} color={colors.text.secondary} />
              <AppText
                variant="body"
                color="secondary"
                style={styles.statusText}
              >
                Last generated:{' '}
                {new Date(lastGenerationTime).toLocaleDateString()}
              </AppText>
            </View>
          )}
        </View>
      )}

      {generatedQuest && (
        <View style={styles.resultContainer}>
          <AppText variant="h3" style={styles.resultTitle}>
            Generated Quest:
          </AppText>
          <AppText variant="body" style={styles.resultText}>
            Quest ID: {generatedQuest.questId}
          </AppText>
          {generatedQuest.category && (
            <AppText
              variant="body"
              color="secondary"
              style={styles.resultDescription}
            >
              Category: {generatedQuest.category}
            </AppText>
          )}
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  titleContainer: {
    flex: 1,
  },
  generateButton: {
    marginBottom: Spacing.md,
  },
  statusContainer: {
    marginBottom: Spacing.md,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  statusText: {
    marginLeft: Spacing.sm,
  },
  resultContainer: {
    marginTop: Spacing.md,
    padding: Spacing.md,
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: 8,
  },
  resultTitle: {
    marginBottom: Spacing.sm,
  },
  resultText: {
    marginBottom: Spacing.xs,
  },
  resultDescription: {
    fontStyle: 'italic',
  },
});

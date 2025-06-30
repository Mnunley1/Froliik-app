import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { AppText } from '@/components/ui/Typography';
import { Spacing } from '@/constants/colors';
import { useThemeColors } from '@/hooks/useColorScheme';
import { useQuestGeneration } from '@/hooks/useQuestGeneration';
import { useMutation, useQuery } from 'convex/react';
import { Settings, Sparkles } from 'lucide-react-native';
import React, { useState } from 'react';
import { StyleSheet, Switch, View } from 'react-native';
import { api } from '../../convex/_generated/api';

export function QuestPreferences() {
  const colors = useThemeColors();
  const currentUser = useQuery(api.users.current);
  const {
    generateQuest,
    isGenerating,
    getAvailableCategories,
    getDifficultyLevels,
  } = useQuestGeneration();
  const [isExpanded, setIsExpanded] = useState(false);

  // Get user settings
  const userSettings = useQuery(
    api.userSettings.getUserSettings,
    currentUser?._id ? { userId: currentUser._id } : 'skip',
  );

  const updateQuestPreferences = useMutation(
    api.userSettings.updateQuestPreferences,
  );

  const handleToggleQuestGeneration = async () => {
    if (!currentUser?._id) return;

    try {
      await updateQuestPreferences({
        userId: currentUser._id,
        questPreferences: {
          autoGenerateQuests:
            !userSettings?.questPreferences?.autoGenerateQuests,
        },
      });
    } catch (error) {
      console.error('Error updating quest preferences:', error);
    }
  };

  const handleTogglePause = async () => {
    if (!currentUser?._id) return;

    try {
      await updateQuestPreferences({
        userId: currentUser._id,
        questPreferences: {
          paused: !userSettings?.questPreferences?.paused,
        },
      });
    } catch (error) {
      console.error('Error updating quest preferences:', error);
    }
  };

  const handleGenerateQuest = async () => {
    if (!currentUser?._id) return;

    try {
      const result = await generateQuest({ userId: currentUser._id });
      if (result.success) {
        console.log('✅ Quest generated successfully:', result.questId);
      } else {
        console.error('Failed to generate quest:', result.error);
      }
    } catch (error) {
      console.error('Error generating quest:', error);
    }
  };

  // Don't render if user hasn't completed onboarding
  if (!currentUser?.onboardingCompleted) {
    return null;
  }

  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Settings size={24} color={colors.primary} />
        </View>
        <View style={styles.titleContainer}>
          <AppText variant="h3">Quest Generation</AppText>
          <AppText variant="body" color="secondary">
            Control how quests are generated for you
          </AppText>
        </View>
        <Button
          title=""
          variant="ghost"
          onPress={() => setIsExpanded(!isExpanded)}
          style={styles.expandButton}
        >
          <AppText variant="body" color="primary">
            {isExpanded ? 'Hide' : 'Show'}
          </AppText>
        </Button>
      </View>

      {isExpanded && (
        <View style={styles.content}>
          {/* Auto Generation Toggle */}
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <AppText variant="body" style={styles.settingTitle}>
                Auto-Generate Quests
              </AppText>
              <AppText
                variant="body"
                color="secondary"
                style={styles.settingDescription}
              >
                Automatically create new quests based on your preferences
              </AppText>
            </View>
            <Switch
              value={
                userSettings?.questPreferences?.autoGenerateQuests || false
              }
              onValueChange={handleToggleQuestGeneration}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.background}
            />
          </View>

          {/* Pause Generation Toggle */}
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <AppText variant="body" style={styles.settingTitle}>
                Pause Generation
              </AppText>
              <AppText
                variant="body"
                color="secondary"
                style={styles.settingDescription}
              >
                Temporarily stop quest generation
              </AppText>
            </View>
            <Switch
              value={userSettings?.questPreferences?.paused || false}
              onValueChange={handleTogglePause}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.background}
            />
          </View>

          {/* Manual Generation Button */}
          <Button
            title={isGenerating ? 'Generating...' : 'Generate Quest Now'}
            onPress={handleGenerateQuest}
            disabled={isGenerating || !currentUser?._id}
            style={styles.generateButton}
            variant="outline"
          >
            <Sparkles size={20} color={colors.primary} />
          </Button>

          {/* Current Settings Display */}
          <View style={styles.settingsInfo}>
            <AppText variant="body" color="secondary" style={styles.infoTitle}>
              Current Settings:
            </AppText>
            <View style={styles.infoRow}>
              <AppText variant="body" color="secondary">
                Difficulty:{' '}
                {userSettings?.questPreferences?.defaultDifficulty ||
                  'moderate'}
              </AppText>
            </View>
            <View style={styles.infoRow}>
              <AppText variant="body" color="secondary">
                Categories:{' '}
                {userSettings?.questPreferences?.preferredCategories?.length ||
                  0}{' '}
                selected
              </AppText>
            </View>
            <View style={styles.infoRow}>
              <AppText variant="body" color="secondary">
                Status:{' '}
                {userSettings?.questPreferences?.paused
                  ? 'Paused'
                  : userSettings?.questPreferences?.autoGenerateQuests
                    ? 'Active'
                    : 'Manual'}
              </AppText>
            </View>
          </View>
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
  expandButton: {
    padding: 0,
  },
  content: {
    gap: Spacing.lg,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingInfo: {
    flex: 1,
    marginRight: Spacing.md,
  },
  settingTitle: {
    marginBottom: Spacing.xs,
  },
  settingDescription: {
    fontSize: 14,
  },
  generateButton: {
    marginTop: Spacing.sm,
  },
  settingsInfo: {
    marginTop: Spacing.md,
    padding: Spacing.md,
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: 8,
  },
  infoTitle: {
    marginBottom: Spacing.sm,
    fontWeight: '600',
  },
  infoRow: {
    marginBottom: Spacing.xs,
  },
});

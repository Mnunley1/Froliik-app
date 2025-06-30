import { Card } from '@/components/ui/Card';
import { AppText } from '@/components/ui/Typography';
import { BorderRadius, Spacing } from '@/constants/colors';
import { useThemeColors } from '@/hooks/useColorScheme';
import { useUserSettings } from '@/hooks/useUserSettings';
import { Target } from 'lucide-react-native';
import React, { useRef, useState } from 'react';
import { StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

const difficultyOptions = [
  { value: 'gentle', label: 'Gentle', description: 'Easy and comfortable' },
  { value: 'moderate', label: 'Moderate', description: 'Balanced challenge' },
  {
    value: 'adventurous',
    label: 'Adventurous',
    description: 'Exciting and bold',
  },
] as const;

const frequencyOptions = [
  { value: 'daily', label: 'Daily', description: 'Every day' },
  { value: 'weekly', label: 'Weekly', description: 'Once a week' },
  { value: 'manual', label: 'Manual', description: 'When I choose' },
] as const;

const categoryOptions = [
  { id: 'mindfulness', label: 'Mindfulness', icon: '🧘' },
  { id: 'creativity', label: 'Creativity', icon: '🎨' },
  { id: 'connection', label: 'Connection', icon: '👥' },
  { id: 'movement', label: 'Movement', icon: '🏃' },
  { id: 'learning', label: 'Learning', icon: '📚' },
  { id: 'adventure', label: 'Adventure', icon: '🗺️' },
  { id: 'productivity', label: 'Productivity', icon: '⚡' },
  { id: 'community', label: 'Community', icon: '🌍' },
  { id: 'wildcard', label: 'Wildcard', icon: '🎲' },
] as const;

function getAvailableCategories(): string[] {
  return [
    'mindfulness',
    'creativity',
    'connection',
    'movement',
    'learning',
    'adventure',
    'productivity',
    'community',
    'wildcard',
  ];
}

export const QuestPreferences = function QuestPreferences({
  onSettingUpdate,
}: {
  onSettingUpdate?: (settingName: string) => void;
} = {}) {
  const colors = useThemeColors();
  const { settings, updateQuestPrefs } = useUserSettings();

  // Optimistic state for immediate UI updates
  const [optimisticSettings, setOptimisticSettings] = useState(
    settings.questPreferences,
  );
  const isInitialized = useRef(false);

  // Only update optimistic settings from server on initial load
  React.useEffect(() => {
    if (!isInitialized.current) {
      setOptimisticSettings(settings.questPreferences);
      isInitialized.current = true;
    }
  }, [settings.questPreferences]);

  // Sync optimistic settings with server settings when they change
  React.useEffect(() => {
    setOptimisticSettings(settings.questPreferences);
  }, [settings.questPreferences]);

  const handleDifficultyChange = async (
    difficulty: 'gentle' | 'moderate' | 'adventurous',
  ) => {
    // Immediately update the optimistic state for instant UI feedback
    setOptimisticSettings((prev) => ({
      ...prev,
      defaultDifficulty: difficulty,
    }));

    try {
      await updateQuestPrefs({ defaultDifficulty: difficulty });
      onSettingUpdate?.('Difficulty level');
    } catch (error) {
      console.error('Error updating difficulty:', error);
      // Revert optimistic update on error
      setOptimisticSettings((prev) => ({
        ...prev,
        defaultDifficulty: settings.questPreferences.defaultDifficulty,
      }));
    }
  };

  const handleCategoryToggle = async (category: string) => {
    // Immediately update the optimistic state for instant UI feedback
    const currentCategories = optimisticSettings.preferredCategories;
    const newCategories = currentCategories.includes(category)
      ? currentCategories.filter((c) => c !== category)
      : [...currentCategories, category];

    setOptimisticSettings((prev) => ({
      ...prev,
      preferredCategories: newCategories,
    }));

    try {
      await updateQuestPrefs({ preferredCategories: newCategories });
      onSettingUpdate?.('Preferred categories');
    } catch (error) {
      console.error('Error updating categories:', error);
      // Revert optimistic update on error
      setOptimisticSettings((prev) => ({
        ...prev,
        preferredCategories: settings.questPreferences.preferredCategories,
      }));
    }
  };

  const handleAutoGenerateToggle = async () => {
    // Immediately update the optimistic state for instant UI feedback
    const newValue = !optimisticSettings.autoGenerateQuests;
    setOptimisticSettings((prev) => ({
      ...prev,
      autoGenerateQuests: newValue,
    }));

    try {
      await updateQuestPrefs({
        autoGenerateQuests: newValue,
      });
      onSettingUpdate?.('Auto-generate quests');
    } catch (error) {
      console.error('Error updating auto-generation:', error);
      // Revert optimistic update on error
      setOptimisticSettings((prev) => ({
        ...prev,
        autoGenerateQuests: settings.questPreferences.autoGenerateQuests,
      }));
    }
  };

  const handlePauseToggle = async () => {
    // Immediately update the optimistic state for instant UI feedback
    const newValue = !optimisticSettings.paused;
    setOptimisticSettings((prev) => ({
      ...prev,
      paused: newValue,
    }));

    try {
      await updateQuestPrefs({
        paused: newValue,
      });
      onSettingUpdate?.('Quest generation pause');
    } catch (error) {
      console.error('Error updating pause setting:', error);
      // Revert optimistic update on error
      setOptimisticSettings((prev) => ({
        ...prev,
        paused: settings.questPreferences.paused,
      }));
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'mindfulness':
        return colors.primary;
      case 'creativity':
        return colors.accent;
      case 'connection':
        return colors.secondary;
      case 'movement':
        return colors.success;
      case 'learning':
        return colors.warning;
      case 'adventure':
        return '#8b5cf6';
      case 'productivity':
        return '#06b6d4';
      case 'community':
        return '#f59e0b';
      default:
        return colors.primary;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'mindfulness':
        return '🧘';
      case 'creativity':
        return '🎨';
      case 'connection':
        return '🤝';
      case 'movement':
        return '🏃';
      case 'learning':
        return '📚';
      case 'adventure':
        return '🗺️';
      case 'productivity':
        return '⚡';
      case 'community':
        return '👥';
      case 'wildcard':
        return '🎲';
      default:
        return '✨';
    }
  };

  if (!settings) {
    return (
      <Card style={styles.container}>
        <View style={styles.header}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: colors.primary + '20' },
            ]}
          >
            <Target size={24} color={colors.primary} strokeWidth={2} />
          </View>
          <View style={styles.headerText}>
            <AppText variant="h3">Quest Preferences</AppText>
            <AppText variant="caption" color="muted">
              Sign in to customize your quest experience
            </AppText>
          </View>
        </View>
      </Card>
    );
  }

  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: colors.primary + '20' },
          ]}
        >
          <Target size={24} color={colors.primary} strokeWidth={2} />
        </View>
        <View style={styles.headerText}>
          <AppText variant="h3">Quest Preferences</AppText>
          <AppText variant="caption" color="muted">
            Customize your quest experience
          </AppText>
        </View>
      </View>

      <View style={styles.settingsContainer}>
        {/* Difficulty Level */}
        <View style={styles.section}>
          <AppText variant="h3" style={styles.sectionTitle}>
            Difficulty Level
          </AppText>
          <View style={styles.difficultyButtons}>
            {(['gentle', 'moderate', 'adventurous'] as const).map(
              (difficulty) => {
                const isSelected =
                  optimisticSettings.defaultDifficulty === difficulty;
                return (
                  <TouchableOpacity
                    key={difficulty}
                    onPress={() => handleDifficultyChange(difficulty)}
                    style={{
                      ...styles.difficultyButton,
                      borderColor: isSelected ? colors.primary : colors.border,
                      backgroundColor: isSelected
                        ? colors.primary
                        : 'transparent',
                    }}
                  >
                    <Text
                      style={{
                        ...styles.difficultyText,
                        color: isSelected
                          ? colors.text.inverse
                          : colors.text.primary,
                      }}
                    >
                      {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                    </Text>
                  </TouchableOpacity>
                );
              },
            )}
          </View>
        </View>

        {/* Preferred Categories */}
        <View style={styles.section}>
          <AppText variant="h3" style={styles.sectionTitle}>
            Preferred Categories
          </AppText>
          <AppText
            variant="caption"
            color="muted"
            style={styles.sectionSubtitle}
          >
            Select the types of quests you enjoy most
          </AppText>
          <View style={styles.categoriesGrid}>
            {getAvailableCategories().map((category: string) => {
              const isSelected =
                optimisticSettings.preferredCategories.includes(category);
              const categoryColor = getCategoryColor(category);
              const categoryIcon = getCategoryIcon(category);

              return (
                <TouchableOpacity
                  key={category}
                  onPress={() => handleCategoryToggle(category)}
                  style={{
                    ...styles.categoryButton,
                    borderColor: categoryColor,
                    backgroundColor: isSelected ? categoryColor : 'transparent',
                  }}
                >
                  <View style={styles.categoryContent}>
                    <AppText style={styles.categoryIcon}>
                      {categoryIcon}
                    </AppText>
                    <Text
                      style={{
                        ...styles.categoryText,
                        color: isSelected
                          ? colors.text.inverse
                          : colors.text.primary,
                      }}
                      numberOfLines={2}
                    >
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Auto Generation Settings */}
        <View style={styles.section}>
          <AppText variant="h3" style={styles.sectionTitle}>
            Quest Generation
          </AppText>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <AppText variant="body" style={styles.settingTitle}>
                Auto-Generate Quests
              </AppText>
              <AppText variant="caption" color="muted">
                Automatically create new quests for you
              </AppText>
            </View>
            <Switch
              value={optimisticSettings.autoGenerateQuests}
              onValueChange={handleAutoGenerateToggle}
              style={styles.switch}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <AppText variant="body" style={styles.settingTitle}>
                Pause Quest Generation
              </AppText>
              <AppText variant="caption" color="muted">
                Temporarily stop automatic quest generation
              </AppText>
            </View>
            <Switch
              value={optimisticSettings.paused}
              onValueChange={handlePauseToggle}
              style={styles.switch}
            />
          </View>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: Spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  headerText: {
    flex: 1,
  },
  settingsContainer: {
    gap: Spacing.lg,
  },
  section: {
    marginTop: Spacing.lg,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  sectionSubtitle: {
    marginBottom: Spacing.md,
  },
  difficultyButtons: {
    gap: Spacing.sm,
  },
  difficultyButton: {
    minHeight: 'auto',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
    shadowOpacity: 0,
    elevation: 0,
    backgroundColor: 'transparent',
    borderWidth: 2,
  },
  difficultyText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
    lineHeight: 18,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  categoryButton: {
    width: '31%', // Slightly smaller to fit 3 per row with gap
    minHeight: 80, // Fixed height for consistency
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
    borderRadius: BorderRadius.lg,
    shadowOpacity: 0,
    elevation: 0,
    backgroundColor: 'transparent',
    borderWidth: 2,
    justifyContent: 'center',
  },
  categoryContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  categoryIcon: {
    fontSize: 20,
    marginBottom: 2,
  },
  categoryText: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
    lineHeight: 14,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    marginBottom: Spacing.xs,
    fontFamily: 'Inter-SemiBold',
  },
  switch: {
    // Ensure consistent switch appearance and prevent jumping
    transform: [{ scaleX: 1 }, { scaleY: 1 }],
  },
});

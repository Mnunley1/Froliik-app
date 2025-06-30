import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { AppText } from '@/components/ui/Typography';
import { Spacing } from '@/constants/colors';
import { useThemeColors } from '@/hooks/useColorScheme';
import { useQuestGeneration } from '@/hooks/useQuestGeneration';
import { RefreshCw, Wand2 } from 'lucide-react-native';
import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

interface QuestGeneratorProps {
  selectedCategory: string;
  onQuestGenerated: () => void;
  onError: (error: string) => void;
}

export function QuestGenerator({
  selectedCategory,
  onQuestGenerated,
  onError,
}: QuestGeneratorProps) {
  const colors = useThemeColors();
  const { generateQuest, isGenerating } = useQuestGeneration();

  const handleGenerateQuest = async () => {
    if (isGenerating) return;

    try {
      console.log('🎯 Generating quest for category:', selectedCategory);

      const result = await generateQuest({
        userId: '', // This will be filled by the hook
        specificCategory: selectedCategory,
      });

      if (!result.success) {
        console.error('❌ Quest generation error:', result.error);
        onError(result.error || 'Failed to generate quest');
        return;
      }

      console.log('✅ Quest generated successfully');

      // Notify parent component that quest was generated
      onQuestGenerated();
    } catch (error) {
      console.error('💥 Error in quest generation:', error);
      onError('Failed to generate quest. Please try again.');
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
      case 'wildcard':
        return '#ec4899';
      default:
        return colors.primary;
    }
  };

  const categoryColor = getCategoryColor(selectedCategory);

  return (
    <Card
      style={[styles.container, { borderColor: categoryColor + '30' }] as any}
    >
      <View style={styles.header}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: categoryColor + '20' },
          ]}
        >
          <Wand2 size={24} color={categoryColor} strokeWidth={2} />
        </View>
        <View style={styles.headerText}>
          <AppText
            variant="h3"
            style={[styles.title, { color: categoryColor }] as any}
          >
            Quest Generator
          </AppText>
          <AppText variant="caption" color="muted">
            Generate a personalized {selectedCategory.toLowerCase()} quest
          </AppText>
        </View>
      </View>

      <Button
        title={isGenerating ? 'Generating...' : 'Generate New Quest'}
        onPress={handleGenerateQuest}
        disabled={isGenerating}
        loading={isGenerating}
        style={
          [styles.generateButton, { backgroundColor: categoryColor }] as any
        }
      >
        {!isGenerating && (
          <View style={styles.buttonContent}>
            <RefreshCw size={18} color={colors.text.inverse} strokeWidth={2} />
            <AppText
              variant="body"
              style={[styles.buttonText, { color: colors.text.inverse }] as any}
            >
              Generate New Quest
            </AppText>
          </View>
        )}
      </Button>

      {isGenerating && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={categoryColor} />
          <AppText variant="caption" color="muted" style={styles.loadingText}>
            Creating your personalized quest...
          </AppText>
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 2,
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
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  headerText: {
    flex: 1,
  },
  title: {
    marginBottom: Spacing.xs,
  },
  generateButton: {
    marginBottom: Spacing.sm,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  buttonText: {
    fontFamily: 'Inter-SemiBold',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  loadingText: {
    fontStyle: 'italic',
  },
});

import { Card } from '@/components/ui/Card';
import { AppText } from '@/components/ui/Typography';
import { BorderRadius, Spacing } from '@/constants/colors';
import { useThemeColors } from '@/hooks/useColorScheme';
import { Clock, MapPin, Sparkles, Target } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Quest } from './QuestCard';

interface CurrentQuestStatusProps {
  quest: Quest;
  onPress?: () => void;
}

export function CurrentQuestStatus({
  quest,
  onPress,
}: CurrentQuestStatusProps) {
  const colors = useThemeColors();

  const getCategoryColor = (category: Quest['category']) => {
    switch (category) {
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
        return colors.muted;
    }
  };

  return (
    <Card
      style={{
        ...styles.container,
        borderColor: getCategoryColor(quest.category) + '40',
      }}
    >
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: getCategoryColor(quest.category) + '20' },
            ]}
          >
            <Target
              size={24}
              color={getCategoryColor(quest.category)}
              strokeWidth={2}
            />
          </View>
          <View style={styles.titleText}>
            <AppText variant="h2" style={{ color: colors.text.primary }}>
              Current Quest
            </AppText>
            <AppText variant="caption" color="muted">
              Your active adventure
            </AppText>
          </View>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: colors.success + '20' },
          ]}
        >
          <Sparkles size={16} color={colors.success} strokeWidth={2} />
          <AppText
            variant="caption"
            style={{ color: colors.success, fontWeight: '600' }}
          >
            Active
          </AppText>
        </View>
      </View>

      <View style={styles.questContent}>
        <AppText
          variant="h3"
          style={{ ...styles.questTitle, color: colors.text.primary }}
        >
          {quest.title}
        </AppText>
        <AppText
          variant="body"
          style={{ ...styles.questDescription, color: colors.text.secondary }}
        >
          {quest.description}
        </AppText>
      </View>

      <View style={styles.meta}>
        <View style={styles.metaItem}>
          <Clock size={16} color={colors.text.muted} strokeWidth={2} />
          <AppText variant="caption" color="muted">
            {quest.duration}
          </AppText>
        </View>

        {quest.location && (
          <View style={styles.metaItem}>
            <MapPin size={16} color={colors.text.muted} strokeWidth={2} />
            <AppText variant="caption" color="muted">
              {quest.location}
            </AppText>
          </View>
        )}

        <View
          style={[
            styles.categoryBadge,
            { backgroundColor: getCategoryColor(quest.category) + '20' },
          ]}
        >
          <Sparkles
            size={12}
            color={getCategoryColor(quest.category)}
            strokeWidth={2}
          />
          <AppText
            variant="caption"
            style={{ color: getCategoryColor(quest.category) }}
          >
            {quest.category}
          </AppText>
        </View>
      </View>

      <View style={styles.encouragement}>
        <AppText variant="body" color="secondary" align="center">
          Ready to tackle this challenge? Tap to start your quest!
        </AppText>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 2,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  titleText: {
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
  },
  questContent: {
    marginBottom: Spacing.lg,
  },
  questTitle: {
    marginBottom: Spacing.sm,
  },
  questDescription: {
    lineHeight: 22,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flexWrap: 'wrap',
    marginBottom: Spacing.lg,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
  },
  encouragement: {
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
});

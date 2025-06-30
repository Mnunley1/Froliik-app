import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppText } from '@/components/ui/Typography';
import { useThemeColors } from '@/hooks/useColorScheme';
import { CircleCheck as CheckCircle, Circle, Trophy, Target } from 'lucide-react-native';
import { Spacing, BorderRadius } from '@/constants/colors';

interface Milestone {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  points: number;
}

interface QuestProgressTrackerProps {
  milestones: Milestone[];
  currentProgress: number;
  totalProgress: number;
  questTitle: string;
}

export function QuestProgressTracker({ 
  milestones, 
  currentProgress, 
  totalProgress, 
  questTitle 
}: QuestProgressTrackerProps) {
  const colors = useThemeColors();
  const progressPercentage = (currentProgress / totalProgress) * 100;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
          <Target size={24} color={colors.primary} strokeWidth={2} />
        </View>
        <View style={styles.headerText}>
          <AppText variant="h3">Quest Progress</AppText>
          <AppText variant="caption" color="muted">
            {currentProgress} of {totalProgress} milestones completed
          </AppText>
        </View>
        <View style={styles.progressBadge}>
          <AppText variant="caption" style={{ color: colors.primary }}>
            {Math.round(progressPercentage)}%
          </AppText>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={[styles.progressBarContainer, { backgroundColor: colors.border }]}>
        <View 
          style={[
            styles.progressBar, 
            { 
              backgroundColor: colors.primary,
              width: `${progressPercentage}%`
            }
          ]} 
        />
      </View>

      {/* Milestones */}
      <View style={styles.milestones}>
        {milestones.map((milestone, index) => (
          <View key={milestone.id} style={styles.milestone}>
            <View style={styles.milestoneIcon}>
              {milestone.completed ? (
                <CheckCircle size={20} color={colors.success} strokeWidth={2} />
              ) : (
                <Circle size={20} color={colors.text.muted} strokeWidth={2} />
              )}
            </View>
            <View style={styles.milestoneContent}>
              <AppText 
                variant="body" 
                style={[
                  styles.milestoneTitle,
                  { color: milestone.completed ? colors.text.primary : colors.text.muted }
                ]}
              >
                {milestone.title}
              </AppText>
              <AppText variant="caption" color="muted">
                {milestone.description}
              </AppText>
              <View style={styles.milestoneFooter}>
                <View style={[styles.pointsBadge, { backgroundColor: colors.warning + '20' }]}>
                  <Trophy size={12} color={colors.warning} strokeWidth={2} />
                  <AppText variant="caption" style={{ color: colors.warning }}>
                    {milestone.points} pts
                  </AppText>
                </View>
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
  progressBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
  },
  progressBarContainer: {
    height: 8,
    borderRadius: 4,
    marginBottom: Spacing.xl,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  milestones: {
    gap: Spacing.lg,
  },
  milestone: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  milestoneIcon: {
    marginRight: Spacing.md,
    marginTop: 2,
  },
  milestoneContent: {
    flex: 1,
  },
  milestoneTitle: {
    marginBottom: Spacing.xs,
  },
  milestoneFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    gap: Spacing.xs,
  },
});
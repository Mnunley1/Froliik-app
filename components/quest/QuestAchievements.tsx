import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { AppText } from '@/components/ui/Typography';
import { Card } from '@/components/ui/Card';
import { useThemeColors } from '@/hooks/useColorScheme';
import { 
  Trophy, 
  Star, 
  Zap, 
  Target, 
  Calendar, 
  Users, 
  Heart,
  Award
} from 'lucide-react-native';
import { Spacing, BorderRadius } from '@/constants/colors';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt?: string;
  progress?: number;
  maxProgress?: number;
}

interface QuestAchievementsProps {
  achievements: Achievement[];
  totalPoints: number;
  level: number;
  nextLevelPoints: number;
}

const achievementIcons = {
  trophy: Trophy,
  star: Star,
  zap: Zap,
  target: Target,
  calendar: Calendar,
  users: Users,
  heart: Heart,
  award: Award,
};

const rarityColors = {
  common: '#6b7280',
  rare: '#3b82f6',
  epic: '#8b5cf6',
  legendary: '#f59e0b',
};

export function QuestAchievements({ 
  achievements, 
  totalPoints, 
  level, 
  nextLevelPoints 
}: QuestAchievementsProps) {
  const colors = useThemeColors();
  const unlockedAchievements = achievements.filter(a => a.unlockedAt);
  const lockedAchievements = achievements.filter(a => !a.unlockedAt);

  return (
    <View style={styles.container}>
      {/* Level Progress */}
      <Card style={styles.levelCard}>
        <View style={styles.levelHeader}>
          <View style={[styles.levelIcon, { backgroundColor: colors.primary + '20' }]}>
            <Award size={24} color={colors.primary} strokeWidth={2} />
          </View>
          <View style={styles.levelInfo}>
            <AppText variant="h3">Level {level}</AppText>
            <AppText variant="caption" color="muted">
              {totalPoints} / {nextLevelPoints} XP
            </AppText>
          </View>
        </View>
        
        <View style={[styles.levelProgressBar, { backgroundColor: colors.border }]}>
          <View 
            style={[
              styles.levelProgress,
              { 
                backgroundColor: colors.primary,
                width: `${(totalPoints / nextLevelPoints) * 100}%`
              }
            ]}
          />
        </View>
      </Card>

      {/* Unlocked Achievements */}
      {unlockedAchievements.length > 0 && (
        <View style={styles.section}>
          <AppText variant="h3" style={styles.sectionTitle}>
            Unlocked Achievements ({unlockedAchievements.length})
          </AppText>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.achievementsScroll}
          >
            <View style={styles.achievementsContainer}>
              {unlockedAchievements.map((achievement) => (
                <AchievementCard 
                  key={achievement.id} 
                  achievement={achievement} 
                  unlocked={true}
                />
              ))}
            </View>
          </ScrollView>
        </View>
      )}

      {/* Locked Achievements */}
      {lockedAchievements.length > 0 && (
        <View style={styles.section}>
          <AppText variant="h3" style={styles.sectionTitle}>
            Locked Achievements ({lockedAchievements.length})
          </AppText>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.achievementsScroll}
          >
            <View style={styles.achievementsContainer}>
              {lockedAchievements.slice(0, 6).map((achievement) => (
                <AchievementCard 
                  key={achievement.id} 
                  achievement={achievement} 
                  unlocked={false}
                />
              ))}
            </View>
          </ScrollView>
        </View>
      )}
    </View>
  );
}

function AchievementCard({ achievement, unlocked }: { achievement: Achievement; unlocked: boolean }) {
  const colors = useThemeColors();
  const IconComponent = achievementIcons[achievement.icon as keyof typeof achievementIcons] || Trophy;
  const rarityColor = rarityColors[achievement.rarity];

  return (
    <Card style={[
      styles.achievementCard,
      { borderColor: unlocked ? rarityColor : colors.border },
      unlocked && { borderWidth: 2 }
    ]}>
      <View style={[
        styles.achievementIcon,
        { backgroundColor: unlocked ? rarityColor + '20' : colors.muted + '20' }
      ]}>
        <IconComponent 
          size={24} 
          color={unlocked ? rarityColor : colors.text.muted} 
          strokeWidth={2} 
        />
      </View>
      
      <AppText 
        variant="caption" 
        style={[
          styles.achievementTitle,
          { color: unlocked ? colors.text.primary : colors.text.muted }
        ]}
      >
        {achievement.title}
      </AppText>
      
      <AppText variant="caption" color="muted" style={styles.achievementDescription}>
        {achievement.description}
      </AppText>

      {achievement.progress !== undefined && achievement.maxProgress && (
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
            <View 
              style={[
                styles.progress,
                { 
                  backgroundColor: rarityColor,
                  width: `${(achievement.progress / achievement.maxProgress) * 100}%`
                }
              ]}
            />
          </View>
          <AppText variant="caption" color="muted" style={styles.progressText}>
            {achievement.progress}/{achievement.maxProgress}
          </AppText>
        </View>
      )}

      <View style={[styles.rarityBadge, { backgroundColor: rarityColor + '20' }]}>
        <AppText variant="caption" style={{ color: rarityColor, fontSize: 10 }}>
          {achievement.rarity.toUpperCase()}
        </AppText>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.xl,
  },
  levelCard: {
    padding: Spacing.lg,
  },
  levelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  levelIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  levelInfo: {
    flex: 1,
  },
  levelProgressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  levelProgress: {
    height: '100%',
    borderRadius: 4,
  },
  section: {
    gap: Spacing.md,
  },
  sectionTitle: {
    paddingHorizontal: Spacing.lg,
  },
  achievementsScroll: {
    marginHorizontal: -Spacing.lg,
  },
  achievementsContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  achievementCard: {
    width: 140,
    padding: Spacing.md,
    alignItems: 'center',
    position: 'relative',
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  achievementTitle: {
    textAlign: 'center',
    marginBottom: Spacing.xs,
    fontWeight: '600',
  },
  achievementDescription: {
    textAlign: 'center',
    fontSize: 11,
    lineHeight: 14,
    marginBottom: Spacing.sm,
  },
  progressContainer: {
    width: '100%',
    marginBottom: Spacing.sm,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    marginBottom: Spacing.xs,
    overflow: 'hidden',
  },
  progress: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    textAlign: 'center',
    fontSize: 10,
  },
  rarityBadge: {
    position: 'absolute',
    top: Spacing.xs,
    right: Spacing.xs,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
});
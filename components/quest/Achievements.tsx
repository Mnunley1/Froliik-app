import { Card } from '@/components/ui/Card';
import { AppText } from '@/components/ui/Typography';
import { BorderRadius, Spacing } from '@/constants/colors';
import { useThemeColors } from '@/hooks/useColorScheme';
import { useQuery } from 'convex/react';
import { Award, Crown, Gem, Star, Trophy, Zap } from 'lucide-react-native';
import React, { useState } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { api } from '../../convex/_generated/api';

export interface Achievement {
  _id: string;
  userId: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt: number;
  points: number;
}

interface AchievementsProps {
  userId?: string;
  showFilters?: boolean;
}

export function Achievements({
  userId,
  showFilters = true,
}: AchievementsProps) {
  const colors = useThemeColors();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Get user achievements - for now, we'll use a placeholder until community API is ready
  const achievements = useQuery(api.quests.getCommunityUpdates, { limit: 5 });

  // Mock achievements for now
  const mockAchievements: Achievement[] = [
    {
      _id: '1',
      userId: 'user1',
      title: 'First Quest',
      description: 'Complete your first quest',
      icon: 'trophy',
      category: 'milestone',
      rarity: 'common',
      unlockedAt: Date.now() - 86400000, // 1 day ago
      points: 10,
    },
    {
      _id: '2',
      userId: 'user1',
      title: 'Streak Master',
      description: 'Complete 7 quests in a row',
      icon: 'zap',
      category: 'streak',
      rarity: 'rare',
      unlockedAt: Date.now() - 172800000, // 2 days ago
      points: 50,
    },
    {
      _id: '3',
      userId: 'user1',
      title: 'Explorer',
      description: 'Try all quest categories',
      icon: 'star',
      category: 'exploration',
      rarity: 'epic',
      unlockedAt: Date.now() - 259200000, // 3 days ago
      points: 100,
    },
    {
      _id: '4',
      userId: 'user1',
      title: 'Legend',
      description: 'Complete 100 quests',
      icon: 'crown',
      category: 'milestone',
      rarity: 'legendary',
      unlockedAt: Date.now() - 345600000, // 4 days ago
      points: 500,
    },
  ];

  const getRarityIcon = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'common':
        return <Star size={16} color={colors.text.muted} />;
      case 'rare':
        return <Zap size={16} color={colors.primary} />;
      case 'epic':
        return <Gem size={16} color={colors.accent} />;
      case 'legendary':
        return <Crown size={16} color={colors.warning} />;
      default:
        return <Star size={16} color={colors.text.muted} />;
    }
  };

  const getRarityColor = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'common':
        return colors.text.muted;
      case 'rare':
        return colors.primary;
      case 'epic':
        return colors.accent;
      case 'legendary':
        return colors.warning;
      default:
        return colors.text.muted;
    }
  };

  const getRarityBackground = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'common':
        return colors.text.muted + '10';
      case 'rare':
        return colors.primary + '10';
      case 'epic':
        return colors.accent + '10';
      case 'legendary':
        return colors.warning + '10';
      default:
        return colors.text.muted + '10';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'milestone':
        return <Trophy size={20} color={colors.success} strokeWidth={2} />;
      case 'streak':
        return <Zap size={20} color={colors.warning} strokeWidth={2} />;
      case 'exploration':
        return <Star size={20} color={colors.primary} strokeWidth={2} />;
      default:
        return <Award size={20} color={colors.secondary} strokeWidth={2} />;
    }
  };

  const formatUnlockDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'milestone', label: 'Milestones' },
    { id: 'streak', label: 'Streaks' },
    { id: 'exploration', label: 'Exploration' },
  ];

  const renderAchievement = ({ item }: { item: Achievement }) => (
    <Card style={styles.achievementCard}>
      <View style={styles.achievementHeader}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: getRarityBackground(item.rarity) },
          ]}
        >
          {getCategoryIcon(item.category)}
        </View>
        <View style={styles.achievementInfo}>
          <View style={styles.titleRow}>
            <AppText variant="body" style={styles.achievementTitle}>
              {item.title}
            </AppText>
            {getRarityIcon(item.rarity)}
          </View>
          <AppText
            variant="caption"
            color="secondary"
            style={styles.description}
          >
            {item.description}
          </AppText>
          <View style={styles.metaRow}>
            <AppText variant="caption" color="muted">
              Unlocked {formatUnlockDate(item.unlockedAt)}
            </AppText>
            <AppText
              variant="caption"
              style={{ color: getRarityColor(item.rarity) }}
            >
              +{item.points} points
            </AppText>
          </View>
        </View>
      </View>
    </Card>
  );

  const filteredAchievements =
    selectedCategory === 'all'
      ? mockAchievements
      : mockAchievements.filter(
          (achievement) => achievement.category === selectedCategory,
        );

  const totalPoints = mockAchievements.reduce(
    (sum, achievement) => sum + achievement.points,
    0,
  );
  const unlockedCount = mockAchievements.length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Trophy size={20} color={colors.text.secondary} strokeWidth={2} />
        <AppText variant="h3" color="secondary">
          Achievements
        </AppText>
      </View>

      <View style={styles.statsContainer}>
        <Card style={styles.statCard}>
          <AppText variant="h2" style={{ color: colors.primary }}>
            {unlockedCount}
          </AppText>
          <AppText variant="caption" color="muted">
            Unlocked
          </AppText>
        </Card>
        <Card style={styles.statCard}>
          <AppText variant="h2" style={{ color: colors.success }}>
            {totalPoints}
          </AppText>
          <AppText variant="caption" color="muted">
            Total Points
          </AppText>
        </Card>
      </View>

      {showFilters && (
        <View style={styles.filtersContainer}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={categories}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  {
                    backgroundColor:
                      selectedCategory === item.id
                        ? colors.primary
                        : colors.surface,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => setSelectedCategory(item.id)}
              >
                <AppText
                  variant="caption"
                  style={{
                    color:
                      selectedCategory === item.id
                        ? colors.background
                        : colors.text.primary,
                  }}
                >
                  {item.label}
                </AppText>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.filtersContent}
          />
        </View>
      )}

      {filteredAchievements.length === 0 ? (
        <Card style={styles.emptyCard}>
          <AppText variant="body" color="muted" align="center">
            No achievements yet
          </AppText>
          <AppText
            variant="caption"
            color="muted"
            align="center"
            style={{ marginTop: Spacing.sm }}
          >
            Complete quests to unlock achievements!
          </AppText>
        </Card>
      ) : (
        <FlatList
          data={filteredAchievements}
          keyExtractor={(item) => item._id}
          renderItem={renderAchievement}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.achievementsContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  statCard: {
    flex: 1,
    padding: Spacing.lg,
    alignItems: 'center',
  },
  filtersContainer: {
    marginBottom: Spacing.lg,
  },
  filtersContent: {
    paddingHorizontal: Spacing.sm,
  },
  filterButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginHorizontal: Spacing.xs,
  },
  emptyCard: {
    padding: Spacing.lg,
  },
  achievementsContent: {
    paddingBottom: Spacing.lg,
  },
  achievementCard: {
    marginBottom: Spacing.md,
    padding: Spacing.lg,
  },
  achievementHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  achievementInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  achievementTitle: {
    fontWeight: '600',
    flex: 1,
  },
  description: {
    marginBottom: Spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

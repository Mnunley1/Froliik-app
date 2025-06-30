import { Card } from '@/components/ui/Card';
import { AppText } from '@/components/ui/Typography';
import { BorderRadius, Spacing } from '@/constants/colors';
import { useThemeColors } from '@/hooks/useColorScheme';
import { useQuery } from 'convex/react';
import {
  Award,
  Crown,
  Medal,
  Star,
  TrendingUp,
  Trophy,
  Users,
} from 'lucide-react-native';
import React, { useState } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { api } from '../../convex/_generated/api';

export interface LeaderboardEntry {
  userId: string;
  userName: string;
  points: number;
  rank: number;
}

interface LeaderboardProps {
  period?: 'daily' | 'weekly' | 'monthly' | 'all_time';
  category?: string;
  limit?: number;
  showFilters?: boolean;
}

export function Leaderboard({
  period = 'all_time',
  category,
  limit = 20,
  showFilters = true,
}: LeaderboardProps) {
  const colors = useThemeColors();
  const [selectedPeriod, setSelectedPeriod] = useState(period);

  // Get leaderboard data - for now, we'll use a placeholder until community API is ready
  const leaderboard = useQuery(api.quests.getCommunityUpdates, { limit: 10 });

  // Mock leaderboard data for now
  const mockLeaderboard = {
    period: selectedPeriod,
    category,
    entries: [
      { userId: '1', userName: 'Adventure Seeker', points: 1250, rank: 1 },
      { userId: '2', userName: 'Quest Master', points: 980, rank: 2 },
      { userId: '3', userName: 'Explorer', points: 750, rank: 3 },
      { userId: '4', userName: 'Wanderer', points: 620, rank: 4 },
      { userId: '5', userName: 'Pathfinder', points: 480, rank: 5 },
    ],
    lastUpdated: Date.now(),
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown size={20} color={colors.warning} fill={colors.warning} />;
      case 2:
        return (
          <Medal size={20} color={colors.text.muted} fill={colors.text.muted} />
        );
      case 3:
        return <Award size={20} color={colors.accent} fill={colors.accent} />;
      default:
        return <Star size={16} color={colors.text.muted} />;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return colors.warning;
      case 2:
        return colors.text.muted;
      case 3:
        return colors.accent;
      default:
        return colors.text.primary;
    }
  };

  const getPeriodLabel = (period: string) => {
    switch (period) {
      case 'daily':
        return 'Today';
      case 'weekly':
        return 'This Week';
      case 'monthly':
        return 'This Month';
      case 'all_time':
        return 'All Time';
      default:
        return 'All Time';
    }
  };

  const periods = [
    { id: 'daily', label: 'Daily' },
    { id: 'weekly', label: 'Weekly' },
    { id: 'monthly', label: 'Monthly' },
    { id: 'all_time', label: 'All Time' },
  ];

  const renderLeaderboardItem = ({
    item,
    index,
  }: {
    item: LeaderboardEntry;
    index: number;
  }) => (
    <Card style={styles.leaderboardItem}>
      <View style={styles.rankContainer}>
        <View style={styles.rankIcon}>{getRankIcon(item.rank)}</View>
        <AppText
          variant="h3"
          style={[styles.rankNumber, { color: getRankColor(item.rank) }] as any}
        >
          #{item.rank}
        </AppText>
      </View>

      <View style={styles.userInfo}>
        <View
          style={[styles.avatar, { backgroundColor: colors.primary + '20' }]}
        >
          <Users size={20} color={colors.primary} strokeWidth={2} />
        </View>
        <View style={styles.userDetails}>
          <AppText variant="body" style={styles.userName}>
            {item.userName}
          </AppText>
          <AppText variant="caption" color="muted">
            {item.points} points
          </AppText>
        </View>
      </View>

      <View style={styles.pointsContainer}>
        <Trophy size={16} color={colors.secondary} strokeWidth={2} />
        <AppText
          variant="body"
          style={{ color: colors.secondary, marginLeft: 4 }}
        >
          {item.points}
        </AppText>
      </View>
    </Card>
  );

  if (!leaderboard) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TrendingUp size={20} color={colors.text.secondary} strokeWidth={2} />
          <AppText variant="h3" color="secondary">
            Leaderboard
          </AppText>
        </View>
        <Card style={styles.loadingCard}>
          <AppText variant="body" color="muted" align="center">
            Loading leaderboard...
          </AppText>
        </Card>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TrendingUp size={20} color={colors.text.secondary} strokeWidth={2} />
        <AppText variant="h3" color="secondary">
          Leaderboard
        </AppText>
      </View>

      {showFilters && (
        <View style={styles.filtersContainer}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={periods}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  {
                    backgroundColor:
                      selectedPeriod === item.id
                        ? colors.primary
                        : colors.surface,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => setSelectedPeriod(item.id as any)}
              >
                <AppText
                  variant="caption"
                  style={{
                    color:
                      selectedPeriod === item.id
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

      <View style={styles.periodLabel}>
        <AppText variant="body" color="secondary">
          {getPeriodLabel(selectedPeriod)}
        </AppText>
      </View>

      {mockLeaderboard.entries.length === 0 ? (
        <Card style={styles.emptyCard}>
          <AppText variant="body" color="muted" align="center">
            No leaderboard data yet
          </AppText>
          <AppText
            variant="caption"
            color="muted"
            align="center"
            style={{ marginTop: Spacing.sm }}
          >
            Complete quests to earn points and climb the ranks!
          </AppText>
        </Card>
      ) : (
        <FlatList
          data={mockLeaderboard.entries}
          keyExtractor={(item) => item.userId}
          renderItem={renderLeaderboardItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.leaderboardContent}
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
  periodLabel: {
    marginBottom: Spacing.md,
  },
  loadingCard: {
    padding: Spacing.lg,
  },
  emptyCard: {
    padding: Spacing.lg,
  },
  leaderboardContent: {
    paddingBottom: Spacing.lg,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  rankContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  rankIcon: {
    marginRight: Spacing.xs,
  },
  rankNumber: {
    fontWeight: '700',
    minWidth: 30,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontWeight: '600',
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

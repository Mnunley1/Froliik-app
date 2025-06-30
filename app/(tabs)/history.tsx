import { EnhancedQuestShareModal } from '@/components/quest/EnhancedQuestShareModal';
import { QuestAchievements } from '@/components/quest/QuestAchievements';
import { Quest, QuestCard } from '@/components/quest/QuestCard';
import { QuestProgressTracker } from '@/components/quest/QuestProgressTracker';
import { useAlert } from '@/components/ui/AlertProvider';
import { Card } from '@/components/ui/Card';
import { AppText } from '@/components/ui/Typography';
import { BorderRadius, Spacing } from '@/constants/colors';
import { useThemeColors } from '@/hooks/useColorScheme';
import { useDeleteSideQuest } from '@/lib/convexQuests';
import { showInAppNotification } from '@/lib/notifications';
import { useQuery } from 'convex/react';
import {
  Award,
  BarChart3,
  BookOpen,
  Briefcase,
  Calendar,
  Crown,
  Flame,
  Globe,
  Heart,
  Mountain,
  Star,
  Target,
  TrendingUp,
  Trophy,
  Users,
  Zap,
} from 'lucide-react-native';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '../../convex/_generated/api';

// Enhanced mock achievements data
const mockAchievements = [
  {
    id: '1',
    title: 'First Quest',
    description: 'Complete your first quest',
    icon: 'trophy',
    rarity: 'common' as const,
    unlockedAt: '2024-01-01',
  },
  {
    id: '2',
    title: 'Streak Master',
    description: 'Complete 7 quests in a row',
    icon: 'zap',
    rarity: 'rare' as const,
    progress: 5,
    maxProgress: 7,
  },
  {
    id: '3',
    title: 'Explorer',
    description: 'Try all quest categories',
    icon: 'target',
    rarity: 'epic' as const,
    progress: 6,
    maxProgress: 9,
  },
  {
    id: '4',
    title: 'Mindful Master',
    description: 'Complete 20 mindfulness quests',
    icon: 'heart',
    rarity: 'rare' as const,
    unlockedAt: '2024-02-15',
  },
  {
    id: '5',
    title: 'Creative Soul',
    description: 'Complete 15 creativity quests',
    icon: 'star',
    rarity: 'rare' as const,
    progress: 8,
    maxProgress: 15,
  },
  {
    id: '6',
    title: 'Legend',
    description: 'Complete 100 quests',
    icon: 'award',
    rarity: 'legendary' as const,
    progress: 23,
    maxProgress: 100,
  },
];

// Mock progress milestones
const mockMilestones = [
  {
    id: '1',
    title: 'Beginner',
    description: 'Complete your first 5 quests',
    completed: true,
    points: 50,
  },
  {
    id: '2',
    title: 'Explorer',
    description: 'Complete 25 quests',
    completed: true,
    points: 100,
  },
  {
    id: '3',
    title: 'Adventurer',
    description: 'Complete 50 quests',
    completed: false,
    points: 200,
  },
  {
    id: '4',
    title: 'Master',
    description: 'Complete 100 quests',
    completed: false,
    points: 500,
  },
  {
    id: '5',
    title: 'Legend',
    description: 'Complete 200 quests',
    completed: false,
    points: 1000,
  },
];

export default function ProgressScreen() {
  const colors = useThemeColors();
  const currentUser = useQuery(api.users.current);
  const completedQuests = useQuery(
    api.quests.getCompletedSideQuests,
    currentUser?._id ? { userId: currentUser._id } : 'skip',
  );
  const deleteSideQuest = useDeleteSideQuest();
  const { showConfirm, showError } = useAlert();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'achievements' | 'history'
  >('overview');
  const [filter, setFilter] = useState<'all' | 'week' | 'month'>('all');
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [selectedQuestForShare, setSelectedQuestForShare] =
    useState<Quest | null>(null);
  const [deletingQuestIds, setDeletingQuestIds] = useState<Set<string>>(
    new Set(),
  );

  const handleShareQuest = (quest: Quest) => {
    setSelectedQuestForShare(quest);
    setShareModalVisible(true);
  };

  const handleDeleteQuest = async (questId: string) => {
    if (deletingQuestIds.has(questId) || !currentUser?._id) {
      return;
    }

    const questToDelete = completedQuests?.find((q) => q._id === questId);
    const questTitle = questToDelete?.title || 'this quest';

    const confirmed = await showConfirm(
      'Delete Quest',
      `Are you sure you want to delete "${questTitle}" from your history? This action cannot be undone.`,
      'Delete',
      'Cancel',
      true,
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingQuestIds((prev) => new Set(prev).add(questId));

      await deleteSideQuest({
        userId: currentUser._id as any,
        questId: questId as any,
      });

      showInAppNotification({
        title: 'Quest Deleted',
        message: 'The quest has been removed from your history.',
        type: 'info',
      });
    } catch (error) {
      console.error('Error deleting quest:', error);
      await showError('Error', 'Failed to delete quest. Please try again.');
    } finally {
      setDeletingQuestIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(questId);
        return newSet;
      });
    }
  };

  const getFilteredQuests = () => {
    if (!completedQuests) return [];

    const now = new Date();
    const filtered = completedQuests.filter((quest) => {
      const questDate = new Date(quest.updatedAt);

      switch (filter) {
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return questDate >= weekAgo;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          return questDate >= monthAgo;
        default:
          return true;
      }
    });

    return filtered.map((quest) => ({
      id: quest._id,
      title: quest.title,
      description: quest.description || '',
      category: (quest.difficultyLevel as any) || 'wildcard',
      duration: '30 minutes', // Default duration
      difficulty: (quest.difficultyLevel as any) || 'moderate',
      isCompleted: true,
    }));
  };

  const filteredQuests = getFilteredQuests();

  // Calculate comprehensive stats
  const stats = {
    total: completedQuests?.length || 0,
    thisWeek:
      completedQuests?.filter((q) => {
        const completedDate = new Date(q.updatedAt);
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return completedDate >= oneWeekAgo;
      }).length || 0,
    thisMonth:
      completedQuests?.filter((q) => {
        const completedDate = new Date(q.updatedAt);
        const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        return completedDate >= oneMonthAgo;
      }).length || 0,
    aiGenerated:
      completedQuests?.filter(
        (q) => q.description?.includes('AI generated') || q.questGiver === 'AI',
      ).length || 0,
    currentStreak: 5,
    longestStreak: 12,
    totalPoints: (completedQuests?.length || 0) * 50,
    averageCompletionTime: '15 min',
  };

  const userLevel = Math.floor(stats.total / 5) + 1;
  const nextLevelPoints = userLevel * 5 * 50;
  const progressToNextLevel = (stats.total % 5) / 5;

  // Category breakdown
  const categoryStats = {
    mindfulness:
      completedQuests?.filter(
        (q) =>
          q.description?.toLowerCase().includes('mindful') ||
          q.description?.toLowerCase().includes('meditation'),
      ).length || 0,
    creativity:
      completedQuests?.filter(
        (q) =>
          q.description?.toLowerCase().includes('creative') ||
          q.description?.toLowerCase().includes('art'),
      ).length || 0,
    connection:
      completedQuests?.filter(
        (q) =>
          q.description?.toLowerCase().includes('connect') ||
          q.description?.toLowerCase().includes('friend'),
      ).length || 0,
    movement:
      completedQuests?.filter(
        (q) =>
          q.description?.toLowerCase().includes('exercise') ||
          q.description?.toLowerCase().includes('workout'),
      ).length || 0,
    learning:
      completedQuests?.filter(
        (q) =>
          q.description?.toLowerCase().includes('learn') ||
          q.description?.toLowerCase().includes('study'),
      ).length || 0,
    adventure:
      completedQuests?.filter(
        (q) =>
          q.description?.toLowerCase().includes('adventure') ||
          q.description?.toLowerCase().includes('explore'),
      ).length || 0,
    productivity:
      completedQuests?.filter(
        (q) =>
          q.description?.toLowerCase().includes('productivity') ||
          q.description?.toLowerCase().includes('work'),
      ).length || 0,
    community:
      completedQuests?.filter(
        (q) =>
          q.description?.toLowerCase().includes('community') ||
          q.description?.toLowerCase().includes('volunteer'),
      ).length || 0,
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'mindfulness':
        return Heart;
      case 'creativity':
        return Star;
      case 'connection':
        return Users;
      case 'movement':
        return Zap;
      case 'learning':
        return BookOpen;
      case 'adventure':
        return Mountain;
      case 'productivity':
        return Briefcase;
      case 'community':
        return Globe;
      default:
        return Target;
    }
  };

  const getCategoryColor = (category: string) => {
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
      default:
        return colors.muted;
    }
  };

  const StatCard = ({
    title,
    value,
    icon: Icon,
    color,
  }: {
    title: string;
    value: string | number;
    icon: any;
    color: string;
  }) => (
    <Card style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
        <Icon size={20} color={color} strokeWidth={2} />
      </View>
      <View style={styles.statContent}>
        <AppText variant="h3" style={{ color: colors.text.primary }}>
          {value}
        </AppText>
        <AppText variant="caption" color="muted">
          {title}
        </AppText>
      </View>
    </Card>
  );

  const CategoryCard = ({
    category,
    count,
  }: {
    category: string;
    count: number;
  }) => {
    const Icon = getCategoryIcon(category);
    const color = getCategoryColor(category);

    return (
      <Card style={styles.categoryCard}>
        <View style={[styles.categoryIcon, { backgroundColor: color + '20' }]}>
          <Icon size={24} color={color} strokeWidth={2} />
        </View>
        <AppText
          variant="h3"
          style={{ color: colors.text.primary, marginTop: Spacing.sm }}
        >
          {count}
        </AppText>
        <AppText
          variant="caption"
          color="muted"
          style={{
            textTransform: 'capitalize',
            textAlign: 'center',
            fontSize: 10,
            flexWrap: 'nowrap',
          }}
        >
          {category}
        </AppText>
      </Card>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <AppText variant="h1" style={{ color: colors.text.primary }}>
              Progress
            </AppText>
            <AppText variant="body" style={{ color: colors.text.secondary }}>
              Track your journey and achievements
            </AppText>
          </View>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'overview' && {
                backgroundColor: colors.primary + '20',
                borderColor: colors.primary,
              },
            ]}
            onPress={() => setActiveTab('overview')}
          >
            <BarChart3
              size={18}
              color={
                activeTab === 'overview' ? colors.primary : colors.text.muted
              }
            />
            <AppText
              variant="caption"
              style={{
                color:
                  activeTab === 'overview' ? colors.primary : colors.text.muted,
                marginLeft: 4,
                fontSize: 11,
                textAlign: 'center',
              }}
            >
              Overview
            </AppText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'achievements' && {
                backgroundColor: colors.warning + '20',
                borderColor: colors.warning,
              },
            ]}
            onPress={() => setActiveTab('achievements')}
          >
            <Trophy
              size={18}
              color={
                activeTab === 'achievements'
                  ? colors.warning
                  : colors.text.muted
              }
            />
            <AppText
              variant="caption"
              style={{
                color:
                  activeTab === 'achievements'
                    ? colors.warning
                    : colors.text.muted,
                marginLeft: 4,
                fontSize: 11,
                textAlign: 'center',
              }}
            >
              Achievements
            </AppText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'history' && {
                backgroundColor: colors.secondary + '20',
                borderColor: colors.secondary,
              },
            ]}
            onPress={() => setActiveTab('history')}
          >
            <Calendar
              size={18}
              color={
                activeTab === 'history' ? colors.secondary : colors.text.muted
              }
            />
            <AppText
              variant="caption"
              style={{
                color:
                  activeTab === 'history'
                    ? colors.secondary
                    : colors.text.muted,
                marginLeft: 4,
                fontSize: 11,
                textAlign: 'center',
              }}
            >
              History
            </AppText>
          </TouchableOpacity>
        </View>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <View>
            {/* Level Progress */}
            <Card style={styles.levelCard}>
              <View style={styles.levelHeader}>
                <View style={styles.levelInfo}>
                  <AppText variant="h2" style={{ color: colors.text.primary }}>
                    Level {userLevel}
                  </AppText>
                  <AppText variant="body" color="secondary">
                    {stats.total} quests completed
                  </AppText>
                </View>
                <View
                  style={[
                    styles.levelBadge,
                    { backgroundColor: colors.primary + '20' },
                  ]}
                >
                  <Crown size={24} color={colors.primary} strokeWidth={2} />
                </View>
              </View>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${progressToNextLevel * 100}%`,
                      backgroundColor: colors.primary,
                    },
                  ]}
                />
              </View>
              <AppText
                variant="caption"
                color="muted"
                style={{ marginTop: Spacing.sm }}
              >
                {stats.total % 5}/5 quests to Level {userLevel + 1}
              </AppText>
            </Card>

            {/* Stats Grid */}
            <View style={styles.statsGrid}>
              <StatCard
                title="Total Points"
                value={stats.totalPoints}
                icon={Award}
                color={colors.primary}
              />
              <StatCard
                title="Current Streak"
                value={stats.currentStreak}
                icon={Flame}
                color={colors.warning}
              />
              <StatCard
                title="This Week"
                value={stats.thisWeek}
                icon={TrendingUp}
                color={colors.success}
              />
              <StatCard
                title="This Month"
                value={stats.thisMonth}
                icon={Calendar}
                color={colors.secondary}
              />
            </View>

            {/* Category Breakdown */}
            <Card style={styles.categoryBreakdown}>
              <AppText
                variant="h3"
                style={{ color: colors.text.primary, marginBottom: Spacing.lg }}
              >
                Category Breakdown
              </AppText>
              <View style={styles.categoryGrid}>
                {Object.entries(categoryStats).map(([category, count]) => (
                  <CategoryCard
                    key={category}
                    category={category}
                    count={count}
                  />
                ))}
              </View>
            </Card>

            {/* Progress Tracker */}
            <Card style={styles.progressCard}>
              <AppText
                variant="h3"
                style={{ color: colors.text.primary, marginBottom: Spacing.lg }}
              >
                Journey Milestones
              </AppText>
              <QuestProgressTracker
                milestones={mockMilestones}
                currentProgress={Math.min(Math.floor(stats.total / 25) + 1, 5)}
                totalProgress={5}
                questTitle="Your Quest Journey"
              />
            </Card>
          </View>
        )}

        {/* Achievements Tab */}
        {activeTab === 'achievements' && (
          <QuestAchievements
            achievements={mockAchievements}
            totalPoints={stats.totalPoints}
            level={userLevel}
            nextLevelPoints={nextLevelPoints}
          />
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <View>
            {/* Filter Buttons */}
            <View style={styles.filterContainer}>
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  filter === 'all' && {
                    backgroundColor: colors.primary + '20',
                    borderColor: colors.primary,
                  },
                ]}
                onPress={() => setFilter('all')}
              >
                <AppText
                  variant="caption"
                  style={{
                    color:
                      filter === 'all' ? colors.primary : colors.text.muted,
                  }}
                >
                  All Time
                </AppText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  filter === 'month' && {
                    backgroundColor: colors.primary + '20',
                    borderColor: colors.primary,
                  },
                ]}
                onPress={() => setFilter('month')}
              >
                <AppText
                  variant="caption"
                  style={{
                    color:
                      filter === 'month' ? colors.primary : colors.text.muted,
                  }}
                >
                  This Month
                </AppText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  filter === 'week' && {
                    backgroundColor: colors.primary + '20',
                    borderColor: colors.primary,
                  },
                ]}
                onPress={() => setFilter('week')}
              >
                <AppText
                  variant="caption"
                  style={{
                    color:
                      filter === 'week' ? colors.primary : colors.text.muted,
                  }}
                >
                  This Week
                </AppText>
              </TouchableOpacity>
            </View>

            {/* Quest List */}
            <View style={styles.questsSection}>
              <View style={styles.sectionHeader}>
                <AppText variant="h3" style={{ color: colors.text.primary }}>
                  Completed Quests
                </AppText>
                <AppText variant="caption" color="muted">
                  {filteredQuests.length} quest
                  {filteredQuests.length !== 1 ? 's' : ''}
                </AppText>
              </View>

              {!completedQuests ? (
                <View style={styles.loadingContainer}>
                  <AppText variant="body" color="muted">
                    Loading completed quests...
                  </AppText>
                </View>
              ) : filteredQuests.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <AppText variant="body" color="muted" align="center">
                    No completed quests yet. Start your journey by completing
                    your first quest!
                  </AppText>
                </View>
              ) : (
                filteredQuests.map((quest) => (
                  <QuestCard
                    key={quest.id}
                    quest={quest}
                    onPress={() => {
                      console.log('Quest selected:', quest.id);
                    }}
                    onDelete={() => handleDeleteQuest(quest.id)}
                    onShare={() => handleShareQuest(quest)}
                    isDeleting={deletingQuestIds.has(quest.id)}
                  />
                ))
              )}
            </View>
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>

      {selectedQuestForShare && (
        <EnhancedQuestShareModal
          visible={shareModalVisible}
          onClose={() => {
            setShareModalVisible(false);
            setSelectedQuestForShare(null);
          }}
          quest={selectedQuestForShare}
          completionTime="15 min"
          achievements={['First Quest', 'Growth Seeker']}
          userLevel={userLevel}
          totalPoints={stats.totalPoints}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  header: {
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  headerContent: {
    flex: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: 'transparent',
    minWidth: 0,
  },
  levelCard: {
    marginBottom: Spacing.xl,
    padding: Spacing.lg,
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  levelInfo: {
    flex: 1,
  },
  levelBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(0,0,0,0.1)',
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  statContent: {
    flex: 1,
  },
  categoryBreakdown: {
    marginBottom: Spacing.xl,
    padding: Spacing.lg,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  categoryCard: {
    width: '30%',
    alignItems: 'center',
    padding: Spacing.md,
    minWidth: 0,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressCard: {
    marginBottom: Spacing.xl,
    padding: Spacing.lg,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  filterButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'transparent',
    alignItems: 'center',
  },
  questsSection: {
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: Spacing.lg,
  },
  loadingContainer: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  emptyContainer: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  bottomPadding: {
    height: Spacing.xl,
  },
});

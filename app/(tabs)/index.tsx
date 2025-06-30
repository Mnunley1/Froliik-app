import { CommunityFeed } from '@/components/quest/CommunityFeed';
import { CurrentQuestStatus } from '@/components/quest/CurrentQuestStatus';
import { Leaderboard } from '@/components/quest/Leaderboard';
import { QuestCard } from '@/components/quest/QuestCard';
import { ConfettiAnimation } from '@/components/ui/ConfettiAnimation';
import { AppText } from '@/components/ui/Typography';
import { BorderRadius, Spacing } from '@/constants/colors';
import { useConvexQuest } from '@/contexts/ConvexQuestContext';
import { useThemeColors } from '@/hooks/useColorScheme';
import { useCompleteSideQuest } from '@/lib/convexQuests';
import {
  sendQuestCompletionNotification,
  showInAppNotification,
} from '@/lib/notifications';
import { useQuery } from 'convex/react';
import {
  Calendar,
  Sparkles,
  Target,
  TrendingUp,
  Users,
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { api } from '../../convex/_generated/api';

type HomeTab = 'quests' | 'community' | 'leaderboard';

export default function HomeScreen() {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const { userId, loading: isLoading } = useConvexQuest();
  const [activeTab, setActiveTab] = useState<HomeTab>('quests');
  const [showConfetti, setShowConfetti] = useState(false);
  const [completingQuestIds, setCompletingQuestIds] = useState<Set<string>>(
    new Set(),
  );
  const completeSideQuest = useCompleteSideQuest();

  // Use Convex queries directly with proper conditional logic
  const activeQuests = useQuery(
    api.quests.getActiveSideQuests,
    userId ? { userId } : 'skip',
  );
  const completedQuests = useQuery(
    api.quests.getCompletedSideQuests,
    userId ? { userId } : 'skip',
  );
  const currentUser = useQuery(api.users.current);

  const [refreshing, setRefreshing] = useState(false);

  // Add null check for activeQuests
  const safeActiveQuests = activeQuests || [];
  const todayQuest = safeActiveQuests.length > 0 ? safeActiveQuests[0] : null;
  const upcomingQuests = safeActiveQuests.slice(1, 4);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      // Convex automatically refreshes data, so we just need to wait a bit
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleCompleteQuest = async (questId: string) => {
    if (completingQuestIds.has(questId) || !userId) {
      return;
    }

    try {
      setCompletingQuestIds((prev) => new Set(prev).add(questId));

      console.log('🎯 Completing quest:', questId);

      await completeSideQuest({
        userId: userId as any,
        questId: questId as any,
      });

      // Find the completed quest for notification
      const completedQuest = activeQuests?.find((q) => q._id === questId);

      if (completedQuest) {
        // Trigger confetti animation
        setShowConfetti(true);

        // Send notification
        await sendQuestCompletionNotification(completedQuest.title);

        showInAppNotification({
          title: 'Quest Completed! 🎉',
          message: `Congratulations! You've completed "${completedQuest.title}"`,
          type: 'success',
        });
      }
    } catch (error) {
      console.error('❌ Error completing quest:', error);
    } finally {
      setCompletingQuestIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(questId);
        return newSet;
      });
    }
  };

  // Convert Convex quests to the format expected by components
  const convertedActiveQuests = safeActiveQuests.map((quest: any) => ({
    id: quest._id,
    title: quest.title,
    description: quest.description || '',
    category: (quest.difficultyLevel as any) || 'wildcard',
    duration: '30 minutes', // Default duration
    difficulty: (quest.difficultyLevel as any) || 'moderate',
    isCompleted: quest.completed,
  }));

  const convertedTodayQuest =
    convertedActiveQuests.length > 0 ? convertedActiveQuests[0] : null;
  const convertedUpcomingQuests = convertedActiveQuests.slice(1, 4);

  const tabs = [
    {
      id: 'quests' as HomeTab,
      label: 'Quests',
      icon: Target,
    },
    {
      id: 'community' as HomeTab,
      label: 'Community',
      icon: Users,
    },
    {
      id: 'leaderboard' as HomeTab,
      label: 'Leaderboard',
      icon: TrendingUp,
    },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'quests':
        return (
          <ScrollView
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={colors.primary}
              />
            }
            contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}
          >
            {/* Current Side Quest Section - IMMEDIATE FOCUS */}
            {convertedTodayQuest && (
              <View style={styles.section}>
                <CurrentQuestStatus
                  quest={convertedTodayQuest}
                  onPress={() => {
                    console.log(
                      'Current quest selected:',
                      convertedTodayQuest.id,
                    );
                  }}
                />
              </View>
            )}

            {/* Upcoming Quests Section - PLANNING */}
            {convertedUpcomingQuests.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Calendar
                    size={20}
                    color={colors.text.secondary}
                    strokeWidth={2}
                  />
                  <AppText variant="h3" color="secondary">
                    Coming Up
                  </AppText>
                </View>
                {convertedUpcomingQuests.map((quest) => (
                  <QuestCard
                    key={quest.id}
                    quest={quest}
                    onPress={() => {
                      console.log('Quest selected:', quest.id);
                    }}
                    onComplete={() => handleCompleteQuest(quest.id)}
                    isCompleting={completingQuestIds.has(quest.id)}
                  />
                ))}
              </View>
            )}

            {/* Empty State */}
            {convertedActiveQuests.length === 0 && (
              <View style={styles.emptyState}>
                <Sparkles size={48} color={colors.text.muted} />
                <AppText variant="h3" color="muted" style={styles.emptyTitle}>
                  No quests available
                </AppText>
                <AppText
                  variant="body"
                  color="secondary"
                  align="center"
                  style={styles.emptyDescription}
                >
                  Check back later for new quests or explore the community to
                  see what others are up to!
                </AppText>
              </View>
            )}

            <View style={styles.bottomPadding} />
          </ScrollView>
        );

      case 'community':
        return (
          <View style={styles.fullContent}>
            <CommunityFeed
              userId={currentUser?._id}
              limit={20}
              showFilters={true}
            />
          </View>
        );

      case 'leaderboard':
        return (
          <View style={styles.fullContent}>
            <Leaderboard period="all_time" limit={20} showFilters={true} />
          </View>
        );

      default:
        return null;
    }
  };

  // Show loading state while data is being fetched
  if (isLoading || activeQuests === undefined) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <View style={styles.loadingContainer}>
          <AppText variant="body" color="secondary">
            Loading your quests...
          </AppText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.header}>
        <View style={styles.greeting}>
          <AppText variant="h1" style={styles.title}>
            Good morning
          </AppText>
          <View style={styles.sparkleContainer}>
            <Sparkles size={32} color={colors.primary} strokeWidth={1.5} />
          </View>
        </View>
        <AppText variant="body" color="secondary">
          Ready for today's adventure?
        </AppText>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          // Get color based on tab type
          const getTabColor = (tabId: string) => {
            switch (tabId) {
              case 'quests':
                return colors.primary;
              case 'community':
                return colors.secondary;
              case 'leaderboard':
                return colors.warning;
              default:
                return colors.primary;
            }
          };

          const tabColor = getTabColor(tab.id);

          return (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tab,
                isActive && {
                  backgroundColor: tabColor + '20',
                  borderColor: tabColor,
                },
              ]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Icon size={18} color={isActive ? tabColor : colors.text.muted} />
              <AppText
                variant="caption"
                style={{
                  color: isActive ? tabColor : colors.text.muted,
                  marginLeft: 4,
                  fontSize: 11,
                  textAlign: 'center',
                }}
              >
                {tab.label}
              </AppText>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Tab Content */}
      <View style={styles.content}>{renderTabContent()}</View>

      {/* Confetti Animation */}
      <ConfettiAnimation
        visible={showConfetti}
        onAnimationComplete={() => setShowConfetti(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  greeting: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  title: {
    marginRight: Spacing.sm,
  },
  sparkleContainer: {
    marginTop: -4,
  },
  section: {
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
    justifyContent: 'space-between',
    paddingTop: Spacing.md,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.xxxl,
  },
  emptyTitle: {
    marginBottom: Spacing.md,
  },
  emptyDescription: {
    maxWidth: 280,
    lineHeight: 22,
  },
  bottomPadding: {
    height: Spacing.xl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.lg,
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
  content: {
    flex: 1,
  },
  filterButton: {
    padding: Spacing.xs,
    borderRadius: 8,
    paddingHorizontal: Spacing.sm,
  },
  fullContent: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
});

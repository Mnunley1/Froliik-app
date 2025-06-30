import { AddQuestModal } from '@/components/quest/AddQuestModal';
import { EnhancedQuestShareModal } from '@/components/quest/EnhancedQuestShareModal';
import { Quest, QuestCard } from '@/components/quest/QuestCard';
import { QuestGenerator } from '@/components/quest/QuestGenerator';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ConfettiAnimation } from '@/components/ui/ConfettiAnimation';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { AppText } from '@/components/ui/Typography';
import { BorderRadius, Spacing } from '@/constants/colors';
import { useAlert } from '@/hooks/useAlert';
import { useThemeColors } from '@/hooks/useColorScheme';
import { useQuestGeneration } from '@/hooks/useQuestGeneration';
import {
  useActiveSideQuests,
  useCompleteSideQuest,
  useDeleteSideQuest,
} from '@/lib/convexQuests';
import {
  sendQuestCompletionNotification,
  showInAppNotification,
} from '@/lib/notifications';
import { useAuth } from '@clerk/clerk-expo';
import { useQuery } from 'convex/react';
import { router } from 'expo-router';
import {
  BookOpen,
  Briefcase,
  Globe,
  Heart,
  Lightbulb,
  Mountain,
  Plus,
  Search,
  Shuffle,
  Sparkles,
  Users,
  Wand as Wand2,
  Zap,
} from 'lucide-react-native';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '../../convex/_generated/api';

const categories = [
  { id: 'all', title: 'All', icon: Search },
  { id: 'mindfulness', title: 'Mindfulness', icon: Heart },
  { id: 'creativity', title: 'Creativity', icon: Lightbulb },
  { id: 'connection', title: 'Connection', icon: Users },
  { id: 'movement', title: 'Movement', icon: Zap },
  { id: 'learning', title: 'Learning', icon: BookOpen },
  { id: 'adventure', title: 'Adventure', icon: Mountain },
  { id: 'productivity', title: 'Productivity', icon: Briefcase },
  { id: 'community', title: 'Community', icon: Globe },
  { id: 'wildcard', title: 'Wildcard', icon: Shuffle },
];

// Mock data for enhanced features
const mockMilestones = [
  {
    id: '1',
    title: 'Start Quest',
    description: 'Begin your journey',
    completed: true,
    points: 10,
  },
  {
    id: '2',
    title: 'First Step',
    description: 'Take the first action',
    completed: true,
    points: 20,
  },
  {
    id: '3',
    title: 'Halfway Point',
    description: 'Reach the middle',
    completed: false,
    points: 30,
  },
  {
    id: '4',
    title: 'Final Push',
    description: 'Almost there',
    completed: false,
    points: 40,
  },
  {
    id: '5',
    title: 'Complete Quest',
    description: 'Finish successfully',
    completed: false,
    points: 50,
  },
];

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
    progress: 3,
    maxProgress: 7,
  },
  {
    id: '3',
    title: 'Explorer',
    description: 'Try all quest categories',
    icon: 'target',
    rarity: 'epic' as const,
    progress: 5,
    maxProgress: 9,
  },
  {
    id: '4',
    title: 'Legend',
    description: 'Complete 100 quests',
    icon: 'award',
    rarity: 'legendary' as const,
    progress: 45,
    maxProgress: 100,
  },
];

export default function ExploreScreen() {
  const colors = useThemeColors();
  const { alertState, showError, showConfirm, showSuccess } = useAlert();
  const { signOut } = useAuth();
  const currentUser = useQuery(api.users.current);
  const { generateQuest } = useQuestGeneration();
  const activeQuests = useActiveSideQuests(currentUser?._id);
  const completeSideQuest = useCompleteSideQuest();
  const deleteSideQuest = useDeleteSideQuest();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [addQuestModalVisible, setAddQuestModalVisible] = useState(false);
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [selectedQuestForShare, setSelectedQuestForShare] =
    useState<Quest | null>(null);
  const [completingQuestIds, setCompletingQuestIds] = useState<Set<string>>(
    new Set(),
  );
  const [deletingQuestIds, setDeletingQuestIds] = useState<Set<string>>(
    new Set(),
  );
  const [showConfetti, setShowConfetti] = useState(false);
  const [isGeneratingQuest, setIsGeneratingQuest] = useState(false);

  // Get user stats for the share modal
  const userProfile = useQuery(
    api.community.getUserProfile,
    currentUser?._id ? { userId: currentUser._id } : 'skip',
  );

  const userLevel = userProfile?.stats?.level || 1;
  const totalPoints = userProfile?.stats?.totalPoints || 0;

  const [localError, setLocalError] = useState<string>('');

  const handleQuestGenerated = () => {
    console.log('🔄 Quest generated, refreshing active quests...');

    // Add a small delay to ensure the database update is complete
    setTimeout(async () => {
      // Convex will automatically refresh the data
      console.log('✅ Active quests refreshed after generation');
    }, 500);

    setLocalError('');

    // Show success notification
    showInAppNotification({
      title: 'Quest Generated! ✨',
      message: `Your new ${selectedCategory} quest has been created and is ready to explore!`,
      type: 'success',
    });
  };

  const handleGenerationError = (errorMessage: string) => {
    console.error('❌ Quest generation error:', errorMessage);
    setLocalError(errorMessage);
  };

  const handleGenerateRandomQuest = async () => {
    if (isGeneratingQuest || !currentUser?._id) return;

    setIsGeneratingQuest(true);
    setLocalError(''); // Clear any previous errors

    try {
      console.log('🎲 Generating random quest based on user preferences...');

      // Use the new user-specific quest generation
      const result = await generateQuest({ userId: currentUser._id }); // No category specified = random from user preferences

      if (result.success) {
        console.log('✅ Random quest generated successfully');

        // Refresh quests immediately
        handleQuestGenerated();
      } else {
        console.error('❌ Failed to generate random quest:', result.error);
        handleGenerationError(result.error || 'Failed to generate quest');
      }
    } catch (error) {
      console.error('❌ Error generating random quest:', error);
      handleGenerationError('An unexpected error occurred');
    } finally {
      setIsGeneratingQuest(false);
    }
  };

  const handleCompleteQuest = async (questId: string) => {
    if (completingQuestIds.has(questId) || !currentUser?._id) {
      return;
    }

    try {
      setCompletingQuestIds((prev) => new Set(prev).add(questId));

      console.log('🎯 Completing quest:', questId);

      await completeSideQuest({
        userId: currentUser._id,
        questId: questId as any,
      });

      // Find the completed quest for sharing
      const completedQuest = activeQuests?.find((q) => q._id === questId);

      if (completedQuest) {
        const convertedQuest: Quest = {
          id: completedQuest._id,
          title: completedQuest.title,
          description: completedQuest.description || '',
          category: (completedQuest.difficultyLevel as any) || 'wildcard',
          duration: '30 minutes', // Default duration
          difficulty: (completedQuest.difficultyLevel as any) || 'moderate',
          isCompleted: true,
        };

        setSelectedQuestForShare(convertedQuest);
        setShareModalVisible(true);

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
      await showError('Error', 'Failed to complete quest. Please try again.');
    } finally {
      setCompletingQuestIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(questId);
        return newSet;
      });
    }
  };

  const handleDeleteQuest = async (questId: string) => {
    if (deletingQuestIds.has(questId) || !currentUser?._id) {
      return;
    }

    const questToDelete = activeQuests?.find((q) => q._id === questId);
    const questTitle = questToDelete?.title || 'this quest';

    const confirmed = await showConfirm(
      'Delete Quest',
      `Are you sure you want to delete "${questTitle}"? This action cannot be undone.`,
      'Delete',
      'Cancel',
      true,
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingQuestIds((prev) => new Set(prev).add(questId));

      console.log('🗑️ Calling deleteSideQuest for:', questId);
      await deleteSideQuest({
        userId: currentUser._id,
        questId: questId as any,
      });

      console.log('✅ Quest deleted successfully');

      showInAppNotification({
        title: 'Quest Deleted',
        message: 'The quest has been removed from your active quests.',
        type: 'info',
      });
    } catch (error) {
      console.error('❌ Error from deleteSideQuest:', error);
      await showError('Error', 'Failed to delete quest. Please try again.');
    } finally {
      setDeletingQuestIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(questId);
        return newSet;
      });
    }
  };

  const handleShareQuest = (quest: Quest) => {
    setSelectedQuestForShare(quest);
    setShareModalVisible(true);
  };

  const handleQuestAdded = () => {
    console.log('🔄 Quest added, refreshing active quests...');

    // Add a small delay to ensure the database update is complete
    setTimeout(async () => {
      // Convex will automatically refresh the data
      console.log('✅ Active quests refreshed after adding');
    }, 500);

    setAddQuestModalVisible(false);

    showInAppNotification({
      title: 'Quest Added! ✨',
      message: 'Your new quest has been created and is ready to explore!',
      type: 'success',
    });
  };

  const getCategoryColor = (categoryId: string) => {
    switch (categoryId) {
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

  // Convert Convex quests to the format expected by components
  const allQuests =
    activeQuests?.map((q) => ({
      id: q._id,
      title: q.title,
      description: q.description || '',
      category: (q.difficultyLevel as any) || 'wildcard',
      duration: '30 minutes', // Default duration
      difficulty: (q.difficultyLevel as any) || 'moderate',
      isCompleted: q.completed,
    })) || [];

  const filteredQuests =
    selectedCategory === 'all'
      ? allQuests
      : allQuests.filter((quest) => quest.category === selectedCategory);

  // Prepare data for QuestGenerator
  const questGeneratorData = {
    totalQuests: allQuests.length,
    completedQuests: allQuests.filter((q) => q.isCompleted).length,
    activeQuests: allQuests.filter((q) => !q.isCompleted).length,
    filteredQuestsCount: filteredQuests.length,
    activeQuestsData:
      activeQuests?.map((q) => ({
        id: q._id,
        title: q.title,
        description: q.description?.substring(0, 50) + '...',
        convertedCategory: (q.difficultyLevel as any) || 'wildcard',
      })) || [],
    filteredQuests: filteredQuests.map((q) => ({
      id: q.id,
      title: q.title,
      category: q.category,
      difficulty: q.difficulty,
      isCompleted: q.isCompleted,
    })),
  };

  // Debug logging for quest filtering
  console.log('🔍 Quest Debug Info:', {
    selectedCategory,
    totalActiveQuests: activeQuests?.length || 0,
    allQuestsCount: allQuests.length,
    filteredQuestsCount: filteredQuests.length,
    activeQuests:
      activeQuests?.map((q) => ({
        id: q._id,
        title: q.title,
        description: q.description?.substring(0, 50) + '...',
        convertedCategory: (q.difficultyLevel as any) || 'wildcard',
      })) || [],
    filteredQuests: filteredQuests.map((q) => ({
      id: q.id,
      title: q.title,
      category: q.category,
    })),
  });

  const selectedCategoryData = categories.find(
    (c) => c.id === selectedCategory,
  );
  const canGenerateQuest = selectedCategory !== 'all';

  const completedQuests = allQuests.filter((q) => q.isCompleted);

  const displayError = localError;

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Spacing.xl * 2 }}
      >
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <AppText variant="h1" style={{ color: colors.text.primary }}>
              Explore Quests
            </AppText>
            <AppText variant="body" style={{ color: colors.text.secondary }}>
              Discover new ways to grow and explore
            </AppText>
          </View>
          <View style={styles.headerActions}>
            <Button
              title=""
              onPress={() => setAddQuestModalVisible(true)}
              style={
                [
                  styles.actionButton,
                  { backgroundColor: colors.primary },
                ] as any
              }
            >
              <Plus size={20} color={colors.text.inverse} strokeWidth={2} />
            </Button>
            <Button
              title=""
              onPress={handleGenerateRandomQuest}
              loading={isGeneratingQuest}
              style={
                [styles.actionButton, { backgroundColor: colors.accent }] as any
              }
            >
              <Wand2 size={20} color={colors.text.inverse} strokeWidth={2} />
            </Button>
            <Button
              title=""
              variant="ghost"
              onPress={handleSignOut}
              style={styles.signOutButton}
            >
              <Sparkles size={24} color={colors.text.primary} />
            </Button>
          </View>
        </View>

        {displayError && (
          <ErrorMessage message={displayError} style={styles.errorMessage} />
        )}

        {/* Category Selector */}
        <Card style={styles.categoryContainer} padding="lg">
          <View style={styles.categoryHeader}>
            <AppText
              variant="h3"
              style={
                [styles.categoryTitle, { color: colors.text.primary }] as any
              }
            >
              Explore Categories
            </AppText>
            <AppText variant="caption" color="muted">
              Choose a category to discover specific quests
            </AppText>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesScroll}
            contentContainerStyle={{ paddingVertical: Spacing.sm }}
          >
            <View style={styles.categories}>
              {categories.map((category) => {
                const IconComponent = category.icon;
                const isSelected = selectedCategory === category.id;
                const categoryColor = getCategoryColor(category.id);

                return (
                  <TouchableOpacity
                    key={category.id}
                    onPress={() => setSelectedCategory(category.id)}
                    style={[
                      styles.categoryButton,
                      {
                        backgroundColor: isSelected
                          ? categoryColor + '15'
                          : colors.background,
                        borderColor: isSelected ? categoryColor : colors.border,
                      },
                    ]}
                    activeOpacity={0.7}
                  >
                    <View style={styles.categoryContent}>
                      <View
                        style={[
                          styles.categoryIcon,
                          {
                            backgroundColor: isSelected
                              ? categoryColor
                              : categoryColor + '20',
                            borderColor: isSelected
                              ? categoryColor
                              : 'transparent',
                          },
                        ]}
                      >
                        <IconComponent
                          size={20}
                          color={
                            isSelected ? colors.text.inverse : categoryColor
                          }
                          strokeWidth={2}
                        />
                      </View>
                      <AppText
                        variant="caption"
                        style={
                          [
                            styles.categoryText,
                            {
                              color: isSelected
                                ? categoryColor
                                : colors.text.secondary,
                              fontWeight: isSelected ? '600' : '400',
                            },
                          ] as any
                        }
                      >
                        {category.title}
                      </AppText>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </Card>

        {/* Quest Generator */}
        {canGenerateQuest && selectedCategoryData && (
          <QuestGenerator
            selectedCategory={selectedCategoryData.title}
            onQuestGenerated={handleQuestGenerated}
            onError={handleGenerationError}
          />
        )}

        {/* Divider before quest list */}
        <View style={styles.divider} />

        {/* Quest List */}
        <View style={styles.questsSection}>
          <View style={styles.sectionHeader}>
            <AppText variant="h3" style={{ color: colors.text.primary } as any}>
              {selectedCategory === 'all'
                ? 'All Quests'
                : categories.find((c) => c.id === selectedCategory)?.title +
                  ' Quests'}
            </AppText>
            <AppText
              variant="caption"
              style={{ color: colors.text.muted } as any}
            >
              {filteredQuests.length} quest
              {filteredQuests.length !== 1 ? 's' : ''}
            </AppText>
          </View>

          {isGeneratingQuest ? (
            <View style={styles.loadingContainer}>
              <AppText variant="body" color="muted">
                Generating quest...
              </AppText>
            </View>
          ) : filteredQuests.length === 0 ? (
            <View style={styles.emptyContainer}>
              <AppText variant="body" color="muted" align="center">
                {selectedCategory === 'all'
                  ? 'No active quests yet. Create your first quest using the + button above!'
                  : `No active ${selectedCategory} quests yet. Generate one above or create a custom quest!`}
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
                onComplete={
                  quest.isCompleted
                    ? undefined
                    : () => handleCompleteQuest(quest.id)
                }
                onDelete={() => handleDeleteQuest(quest.id)}
                onShare={
                  quest.isCompleted ? () => handleShareQuest(quest) : undefined
                }
                isCompleting={completingQuestIds.has(quest.id)}
                isDeleting={deletingQuestIds.has(quest.id)}
              />
            ))
          )}
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      <AddQuestModal
        visible={addQuestModalVisible}
        onClose={() => setAddQuestModalVisible(false)}
      />

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
          totalPoints={totalPoints}
        />
      )}

      {/* Custom Alert Component */}
      <Alert
        visible={alertState.visible}
        title={alertState.title}
        message={alertState.message}
        type={alertState.type}
        confirmText={alertState.confirmText}
        cancelText={alertState.cancelText}
        onConfirm={alertState.onConfirm}
        onCancel={alertState.onCancel}
        onDismiss={alertState.onCancel}
        showCancel={alertState.showCancel}
        destructive={alertState.destructive}
      />

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
  scrollView: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  headerContent: {
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginLeft: Spacing.md,
    marginTop: Spacing.xs,
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    paddingHorizontal: 0,
  },
  errorMessage: {
    marginBottom: Spacing.lg,
  },
  categoryContainer: {
    marginBottom: Spacing.xl,
    borderRadius: BorderRadius.xl,
  },
  categoryHeader: {
    marginBottom: Spacing.md,
  },
  categoryTitle: {
    marginBottom: Spacing.xs,
  },
  categoriesScroll: {
    marginHorizontal: -Spacing.lg,
  },
  categories: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  categoryButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    minWidth: 80,
    alignItems: 'center',
  },
  categoryContent: {
    alignItems: 'center',
    minWidth: 60,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  categoryText: {
    fontSize: 12,
    textAlign: 'center',
    flexWrap: 'nowrap',
  },
  divider: {
    height: 1,
    backgroundColor: '#EEE',
    marginVertical: Spacing.lg,
    borderRadius: 1,
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
  signOutButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    paddingHorizontal: 0,
  },
});

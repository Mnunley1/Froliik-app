import { Card } from '@/components/ui/Card';
import { AppText } from '@/components/ui/Typography';
import { BorderRadius, Spacing } from '@/constants/colors';
import { useThemeColors } from '@/hooks/useColorScheme';
import { useCommunityLikes } from '@/hooks/useQuestGeneration';
import { useQuery } from 'convex/react';
import {
  Clock,
  Heart,
  MessageCircle,
  Sparkles,
  Trophy,
  Users,
  Zap,
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { api } from '../../convex/_generated/api';
import { CommentModal } from './CommentModal';

export interface CommunityFeedItem {
  _id: string;
  userId: string;
  userName: string;
  userEmail: string;
  action: 'completed' | 'created' | 'shared' | 'achievement' | 'level_up';
  questTitle: string;
  questCategory?: string;
  achievement?: string;
  timestamp: number;
  questId?: string;
  points?: number;
  level?: number;
  likes?: number;
  comments?: number;
  user?: {
    _id: string;
    fullName?: string;
    username?: string;
    avatar?: string;
    level?: number;
  };
  isLiked?: boolean;
}

interface CommunityFeedProps {
  userId?: string;
  limit?: number;
  showFilters?: boolean;
}

export function CommunityFeed({
  userId,
  limit = 20,
  showFilters = true,
}: CommunityFeedProps) {
  const colors = useThemeColors();
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [optimisticLikes, setOptimisticLikes] = useState<Set<string>>(
    new Set(),
  );
  const [loadingLikes, setLoadingLikes] = useState<Set<string>>(new Set());
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [selectedUpdate, setSelectedUpdate] =
    useState<CommunityFeedItem | null>(null);
  const { likeUpdate, unlikeUpdate } = useCommunityLikes();

  // Get community updates with likes
  const updates = useQuery(api.quests.getCommunityUpdatesWithLikes, {
    limit,
    userId: userId as any,
  });

  // Initialize optimistic likes from server data
  React.useEffect(() => {
    if (updates) {
      const serverLikedUpdates = new Set(
        updates
          .filter((update: any) => update.isLiked)
          .map((update: any) => update._id),
      );
      setOptimisticLikes(serverLikedUpdates);
    }
  }, [updates]);

  const handleLike = async (updateId: string) => {
    if (!userId || loadingLikes.has(updateId)) return;

    const isCurrentlyLiked = optimisticLikes.has(updateId);

    try {
      // Set loading state
      setLoadingLikes((prev) => new Set(prev).add(updateId));

      // Optimistic update
      setOptimisticLikes((prev) => {
        const newSet = new Set(prev);
        if (isCurrentlyLiked) {
          newSet.delete(updateId);
        } else {
          newSet.add(updateId);
        }
        return newSet;
      });

      if (isCurrentlyLiked) {
        await unlikeUpdate(updateId, userId);
      } else {
        await likeUpdate(updateId, userId);
      }
    } catch (error) {
      // Revert optimistic update on error
      setOptimisticLikes((prev) => {
        const newSet = new Set(prev);
        if (isCurrentlyLiked) {
          newSet.add(updateId);
        } else {
          newSet.delete(updateId);
        }
        return newSet;
      });
      console.error('Error handling like:', error);
    } finally {
      // Clear loading state
      setLoadingLikes((prev) => {
        const newSet = new Set(prev);
        newSet.delete(updateId);
        return newSet;
      });
    }
  };

  const handleComment = async (updateId: string) => {
    if (!userId) return;

    // Find the update to show in the modal
    const update = updates?.find((u: any) => u._id === updateId);
    if (update) {
      setSelectedUpdate(update);
      setCommentModalVisible(true);
    }
  };

  const handleCloseCommentModal = () => {
    setCommentModalVisible(false);
    setSelectedUpdate(null);
  };

  const getActionIcon = (action: CommunityFeedItem['action']) => {
    switch (action) {
      case 'completed':
        return <Trophy size={16} color={colors.success} strokeWidth={2} />;
      case 'created':
        return <Sparkles size={16} color={colors.primary} strokeWidth={2} />;
      case 'shared':
        return (
          <MessageCircle size={16} color={colors.secondary} strokeWidth={2} />
        );
      case 'achievement':
        return <Trophy size={16} color={colors.accent} strokeWidth={2} />;
      case 'level_up':
        return <Zap size={16} color={colors.warning} strokeWidth={2} />;
      default:
        return <Sparkles size={16} color={colors.primary} strokeWidth={2} />;
    }
  };

  const getActionText = (action: CommunityFeedItem['action']) => {
    switch (action) {
      case 'completed':
        return 'completed';
      case 'created':
        return 'created';
      case 'shared':
        return 'shared';
      case 'achievement':
        return 'unlocked';
      case 'level_up':
        return 'reached';
      default:
        return 'updated';
    }
  };

  const getActionColor = (action: CommunityFeedItem['action']) => {
    switch (action) {
      case 'completed':
        return colors.success;
      case 'created':
        return colors.primary;
      case 'shared':
        return colors.secondary;
      case 'achievement':
        return colors.accent;
      case 'level_up':
        return colors.warning;
      default:
        return colors.primary;
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60),
    );

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return date.toLocaleDateString();
  };

  const renderUserAvatar = (user?: CommunityFeedItem['user']) => {
    if (user?.avatar) {
      return (
        <Image
          source={{ uri: user.avatar }}
          style={styles.avatar}
          resizeMode="cover"
        />
      );
    }

    return (
      <View style={[styles.avatar, { backgroundColor: colors.primary + '20' }]}>
        <Users size={20} color={colors.primary} strokeWidth={2} />
      </View>
    );
  };

  const renderFeedItem = ({ item }: { item: CommunityFeedItem }) => (
    <Card style={styles.feedItem}>
      <View style={styles.itemHeader}>
        <View style={styles.userInfo}>
          {renderUserAvatar(item.user)}
          <View style={styles.userDetails}>
            <AppText variant="body" style={styles.userName}>
              {item.user?.fullName || item.user?.username || item.userName}
            </AppText>
            <View style={styles.userMeta}>
              {item.user?.level && (
                <View
                  style={[
                    styles.levelBadge,
                    { backgroundColor: colors.primary + '20' },
                  ]}
                >
                  <AppText
                    variant="caption"
                    style={{ color: colors.primary, fontWeight: '600' }}
                  >
                    Lv.{item.user.level}
                  </AppText>
                </View>
              )}
              <View style={styles.timestampContainer}>
                <Clock size={12} color={colors.text.muted} strokeWidth={2} />
                <AppText variant="caption" color="muted">
                  {formatTimestamp(item.timestamp)}
                </AppText>
              </View>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.itemContent}>
        <View
          style={[
            styles.actionContainer,
            { backgroundColor: getActionColor(item.action) + '15' },
          ]}
        >
          <View
            style={[
              styles.actionIconContainer,
              { backgroundColor: getActionColor(item.action) + '30' },
            ]}
          >
            {getActionIcon(item.action)}
          </View>
          <AppText
            variant="body"
            style={{
              ...styles.actionText,
              color: getActionColor(item.action),
              fontWeight: '600',
            }}
          >
            {getActionText(item.action)}
          </AppText>
        </View>

        <View style={styles.questContent}>
          <AppText variant="h3" style={styles.questTitle}>
            {item.questTitle}
          </AppText>

          {item.questCategory && (
            <View
              style={[
                styles.categoryBadge,
                { backgroundColor: colors.surface },
              ]}
            >
              <AppText variant="caption" color="secondary">
                {item.questCategory}
              </AppText>
            </View>
          )}
        </View>

        {(item.achievement || item.points) && (
          <View style={styles.achievementSection}>
            {item.achievement && (
              <View
                style={[
                  styles.achievementBadge,
                  { backgroundColor: colors.accent + '20' },
                ]}
              >
                <Trophy size={14} color={colors.accent} strokeWidth={2} />
                <AppText
                  variant="caption"
                  style={{ color: colors.accent, fontWeight: '600' }}
                >
                  {item.achievement}
                </AppText>
              </View>
            )}

            {item.points && (
              <View
                style={[
                  styles.pointsBadge,
                  { backgroundColor: colors.success + '20' },
                ]}
              >
                <AppText
                  variant="caption"
                  style={{ color: colors.success, fontWeight: '600' }}
                >
                  +{item.points} XP
                </AppText>
              </View>
            )}
          </View>
        )}

        {item.level && item.action === 'level_up' && (
          <View
            style={[
              styles.levelUpContainer,
              { backgroundColor: colors.warning + '20' },
            ]}
          >
            <Zap size={16} color={colors.warning} strokeWidth={2} />
            <AppText
              variant="body"
              style={{ color: colors.warning, fontWeight: '600' }}
            >
              Reached Level {item.level}!
            </AppText>
          </View>
        )}
      </View>

      <View style={styles.itemActions}>
        <TouchableOpacity
          style={[
            styles.actionButton,
            loadingLikes.has(item._id) && styles.actionButtonDisabled,
          ]}
          onPress={() => handleLike(item._id)}
          disabled={loadingLikes.has(item._id)}
        >
          <Heart
            size={18}
            color={
              optimisticLikes.has(item._id) ? colors.error : colors.text.muted
            }
            fill={optimisticLikes.has(item._id) ? colors.error : 'none'}
            strokeWidth={2}
          />
          <AppText
            variant="caption"
            style={{
              color: optimisticLikes.has(item._id)
                ? colors.error
                : colors.text.muted,
              marginLeft: 6,
              fontWeight: '500',
            }}
          >
            {item.likes || 0}
          </AppText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionButton,
            (item.comments || 0) > 0 && styles.actionButtonActive,
          ]}
          onPress={() => handleComment(item._id)}
        >
          <MessageCircle
            size={18}
            color={
              (item.comments || 0) > 0 ? colors.primary : colors.text.muted
            }
            strokeWidth={2}
          />
          <AppText
            variant="caption"
            style={{
              marginLeft: 6,
              color:
                (item.comments || 0) > 0 ? colors.primary : colors.text.muted,
              fontWeight: '500',
            }}
          >
            {item.comments || 0}
          </AppText>
        </TouchableOpacity>
      </View>
    </Card>
  );

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'completed', label: 'Completed' },
    { id: 'achievement', label: 'Achievements' },
    { id: 'level_up', label: 'Level Ups' },
  ];

  if (!updates) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Users size={20} color={colors.text.secondary} strokeWidth={2} />
          <AppText variant="h3" color="secondary">
            Community Feed
          </AppText>
        </View>
        <Card style={styles.loadingCard}>
          <AppText variant="body" color="muted" align="center">
            Loading community feed...
          </AppText>
        </Card>
      </View>
    );
  }

  const filteredUpdates =
    selectedFilter === 'all'
      ? updates
      : updates.filter((update: any) => update.action === selectedFilter);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Users size={20} color={colors.text.secondary} strokeWidth={2} />
        <AppText variant="h3" color="secondary">
          Community Feed
        </AppText>
      </View>

      {showFilters && (
        <View style={styles.filtersContainer}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={filters}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  {
                    backgroundColor:
                      selectedFilter === item.id
                        ? colors.primary
                        : colors.surface,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => setSelectedFilter(item.id)}
              >
                <AppText
                  variant="caption"
                  style={{
                    color:
                      selectedFilter === item.id
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

      {filteredUpdates.length === 0 ? (
        <Card style={styles.emptyCard}>
          <AppText variant="body" color="muted" align="center">
            No community updates yet
          </AppText>
          <AppText
            variant="caption"
            color="muted"
            align="center"
            style={{ marginTop: Spacing.sm }}
          >
            Complete your first quest to see it here!
          </AppText>
        </Card>
      ) : (
        <FlatList
          data={filteredUpdates}
          keyExtractor={(item) => item._id}
          renderItem={renderFeedItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.feedContent}
        />
      )}

      {commentModalVisible && selectedUpdate && (
        <CommentModal
          visible={commentModalVisible}
          onClose={handleCloseCommentModal}
          updateId={selectedUpdate._id}
          userId={userId}
          updateTitle={selectedUpdate.questTitle}
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
  loadingCard: {
    padding: Spacing.lg,
  },
  emptyCard: {
    padding: Spacing.lg,
  },
  feedContent: {
    paddingBottom: Spacing.lg,
  },
  feedItem: {
    marginBottom: Spacing.md,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
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
  userMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  levelBadge: {
    paddingHorizontal: Spacing.xs,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    marginRight: Spacing.sm,
  },
  timestampContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemContent: {
    marginBottom: Spacing.md,
  },
  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  actionIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  actionText: {
    marginLeft: Spacing.xs,
    fontWeight: '500',
  },
  questTitle: {
    fontWeight: '600',
    marginBottom: Spacing.sm,
    lineHeight: 24,
  },
  questContent: {
    marginBottom: Spacing.sm,
  },
  categoryBadge: {
    paddingHorizontal: Spacing.xs,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    marginTop: Spacing.xs,
  },
  achievementSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  achievementBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    alignSelf: 'flex-start',
    marginRight: Spacing.sm,
  },
  pointsBadge: {
    paddingHorizontal: Spacing.xs,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    marginLeft: Spacing.sm,
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.08)',
    paddingTop: Spacing.md,
    marginTop: Spacing.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: Spacing.lg,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  actionButtonActive: {
    opacity: 1,
  },
  levelUpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    marginTop: Spacing.xs,
  },
});

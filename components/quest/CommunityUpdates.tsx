import { Card } from '@/components/ui/Card';
import { AppText } from '@/components/ui/Typography';
import { BorderRadius, Spacing } from '@/constants/colors';
import { useThemeColors } from '@/hooks/useColorScheme';
import { Clock, Sparkles, Trophy, Users } from 'lucide-react-native';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

export interface CommunityUpdate {
  id: string;
  userId: string;
  userName: string;
  action: 'completed' | 'created' | 'shared';
  questTitle: string;
  questCategory: string;
  timestamp: string;
  achievement?: string;
}

interface CommunityUpdatesProps {
  updates: CommunityUpdate[];
  isLoading?: boolean;
}

export function CommunityUpdates({
  updates,
  isLoading = false,
}: CommunityUpdatesProps) {
  const colors = useThemeColors();

  const getActionIcon = (action: CommunityUpdate['action']) => {
    switch (action) {
      case 'completed':
        return <Trophy size={16} color={colors.success} strokeWidth={2} />;
      case 'created':
        return <Sparkles size={16} color={colors.primary} strokeWidth={2} />;
      case 'shared':
        return <Users size={16} color={colors.secondary} strokeWidth={2} />;
      default:
        return <Sparkles size={16} color={colors.primary} strokeWidth={2} />;
    }
  };

  const getActionText = (action: CommunityUpdate['action']) => {
    switch (action) {
      case 'completed':
        return 'completed';
      case 'created':
        return 'created';
      case 'shared':
        return 'shared';
      default:
        return 'updated';
    }
  };

  const getActionColor = (action: CommunityUpdate['action']) => {
    switch (action) {
      case 'completed':
        return colors.success;
      case 'created':
        return colors.primary;
      case 'shared':
        return colors.secondary;
      default:
        return colors.primary;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Users size={20} color={colors.text.secondary} strokeWidth={2} />
          <AppText variant="h3" color="secondary">
            Community Updates
          </AppText>
        </View>
        <Card style={styles.loadingCard}>
          <AppText variant="body" color="muted" align="center">
            Loading community updates...
          </AppText>
        </Card>
      </View>
    );
  }

  if (updates.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Users size={20} color={colors.text.secondary} strokeWidth={2} />
          <AppText variant="h3" color="secondary">
            Community Updates
          </AppText>
        </View>
        <Card style={styles.emptyCard}>
          <AppText variant="body" color="muted" align="center">
            Be the first to complete a quest and inspire others!
          </AppText>
          <AppText
            variant="caption"
            color="muted"
            align="center"
            style={{ marginTop: Spacing.sm }}
          >
            Complete your first quest to see it here
          </AppText>
        </Card>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Users size={20} color={colors.text.secondary} strokeWidth={2} />
        <AppText variant="h3" color="secondary">
          Community Updates
        </AppText>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {updates.map((update) => (
          <Card key={update.id} style={styles.updateCard}>
            <View style={styles.updateHeader}>
              <View style={styles.actionContainer}>
                {getActionIcon(update.action)}
                <AppText
                  variant="caption"
                  style={{
                    ...styles.actionText,
                    color: getActionColor(update.action),
                  }}
                >
                  {getActionText(update.action)}
                </AppText>
              </View>
              <View style={styles.timestampContainer}>
                <Clock size={12} color={colors.text.muted} strokeWidth={2} />
                <AppText variant="caption" color="muted">
                  {formatTimestamp(update.timestamp)}
                </AppText>
              </View>
            </View>

            <AppText
              variant="body"
              style={{ ...styles.userName, color: colors.text.primary }}
            >
              {update.userName}
            </AppText>

            <AppText
              variant="body"
              style={{ ...styles.questTitle, color: colors.text.secondary }}
            >
              "{update.questTitle}"
            </AppText>

            {update.achievement && (
              <View
                style={[
                  styles.achievementBadge,
                  { backgroundColor: colors.accent + '20' },
                ]}
              >
                <Trophy size={12} color={colors.accent} strokeWidth={2} />
                <AppText variant="caption" style={{ color: colors.accent }}>
                  {update.achievement}
                </AppText>
              </View>
            )}
          </Card>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  scrollContent: {
    paddingRight: Spacing.lg,
  },
  updateCard: {
    width: 280,
    marginRight: Spacing.md,
    padding: Spacing.md,
  },
  loadingCard: {
    padding: Spacing.xl,
  },
  emptyCard: {
    padding: Spacing.xl,
  },
  updateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  actionText: {
    fontWeight: '600',
  },
  timestampContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  userName: {
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  questTitle: {
    fontStyle: 'italic',
    marginBottom: Spacing.sm,
  },
  achievementBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
  },
});

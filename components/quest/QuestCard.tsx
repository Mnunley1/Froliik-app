import React from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AppText } from '@/components/ui/Typography';
import { useThemeColors } from '@/hooks/useColorScheme';
import { Sparkles, Clock, MapPin, CircleCheck as CheckCircle, Trash2, Zap, Share2 } from 'lucide-react-native';
import { Spacing, BorderRadius } from '@/constants/colors';

export interface Quest {
  id: string;
  title: string;
  description: string;
  category: 'mindfulness' | 'creativity' | 'connection' | 'movement' | 'learning' | 'adventure' | 'productivity' | 'community' | 'wildcard';
  duration: string;
  location?: string;
  difficulty: 'gentle' | 'moderate' | 'adventurous';
  isCompleted?: boolean;
}

interface QuestCardProps {
  quest: Quest;
  onPress?: () => void;
  onComplete?: () => void;
  onDelete?: () => void;
  onShare?: () => void;
  featured?: boolean;
  isCompleting?: boolean;
  isDeleting?: boolean;
}

export function QuestCard({ 
  quest, 
  onPress, 
  onComplete, 
  onDelete, 
  onShare, 
  featured = false,
  isCompleting = false,
  isDeleting = false
}: QuestCardProps) {
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

  const getDifficultyText = (difficulty: Quest['difficulty']) => {
    switch (difficulty) {
      case 'gentle':
        return 'Gentle';
      case 'moderate':
        return 'Moderate';
      case 'adventurous':
        return 'Adventurous';
      default:
        return 'Gentle';
    }
  };

  const handleCompleteQuest = () => {
    if (quest.isCompleted || !onComplete || isCompleting) return;
    onComplete();
  };

  const handleDeleteQuest = () => {
    if (!onDelete || isDeleting) return;
    // The confirmation dialog is now handled in the parent component
    onDelete();
  };

  const isGenerated = quest.id.startsWith('quest_') || quest.description.includes('AI generated');

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <Card style={[
        styles.card, 
        featured && styles.featuredCard,
        (isCompleting || isDeleting) && styles.processingCard
      ]}>
        <View style={styles.header}>
          <View style={styles.categoryContainer}>
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
                variant="overline"
                style={[styles.categoryText, { color: getCategoryColor(quest.category) }]}
              >
                {quest.category}
              </AppText>
              {isGenerated && (
                <Zap
                  size={10}
                  color={getCategoryColor(quest.category)}
                  strokeWidth={2}
                />
              )}
            </View>
          </View>

          <View style={styles.headerActions}>
            {quest.isCompleted && (
              <View style={[styles.completedBadge, { backgroundColor: colors.success + '20' }]}>
                <CheckCircle size={14} color={colors.success} strokeWidth={2} />
                <AppText
                  variant="caption"
                  style={{ color: colors.success }}
                >
                  Complete
                </AppText>
              </View>
            )}
            
            {/* Quick Actions Menu */}
            <View style={styles.quickActions}>
              {onShare && quest.isCompleted && (
                <Button
                  title=""
                  onPress={onShare}
                  variant="ghost"
                  style={styles.quickActionButton}
                >
                  <Share2 size={16} color={colors.primary} strokeWidth={2} />
                </Button>
              )}
              
              {onDelete && (
                <Button
                  title=""
                  onPress={handleDeleteQuest}
                  variant="ghost"
                  loading={isDeleting}
                  disabled={isDeleting}
                  style={[styles.quickActionButton, styles.deleteButton]}
                >
                  {!isDeleting && (
                    <Trash2 size={16} color={colors.error} strokeWidth={2} />
                  )}
                </Button>
              )}
            </View>
          </View>
        </View>

        <View style={styles.content}>
          <AppText variant={featured ? 'h2' : 'h3'} style={[styles.title, { color: colors.text.primary }]}>
            {quest.title}
          </AppText>
          <AppText variant="body" style={[styles.description, { color: colors.text.secondary }]}>
            {quest.description}
          </AppText>
        </View>

        <View style={styles.meta}>
          <View style={styles.metaItem}>
            <Clock size={14} color={colors.text.muted} strokeWidth={2} />
            <AppText variant="caption" style={{ color: colors.text.muted }}>
              {quest.duration}
            </AppText>
          </View>

          {quest.location && (
            <View style={styles.metaItem}>
              <MapPin size={14} color={colors.text.muted} strokeWidth={2} />
              <AppText variant="caption" style={{ color: colors.text.muted }}>
                {quest.location}
              </AppText>
            </View>
          )}

          <View style={styles.metaItem}>
            <AppText variant="caption" style={{ color: colors.text.muted }}>
              {getDifficultyText(quest.difficulty)}
            </AppText>
          </View>

          {isGenerated && (
            <View style={[styles.aiBadge, { backgroundColor: colors.accent + '20' }]}>
              <Zap size={12} color={colors.accent} strokeWidth={2} />
              <AppText variant="caption" style={{ color: colors.accent, fontSize: 10 }}>
                AI
              </AppText>
            </View>
          )}
        </View>

        {/* Main Action Button */}
        {onComplete && !quest.isCompleted && (
          <View style={styles.mainAction}>
            <Button
              title={isCompleting ? "Completing..." : "Complete Quest"}
              onPress={handleCompleteQuest}
              variant="primary"
              size="sm"
              loading={isCompleting}
              disabled={isCompleting || isDeleting}
              style={styles.completeButton}
            >
              {!isCompleting && (
                <View style={styles.actionButtonContent}>
                  <CheckCircle size={16} color={colors.text.inverse} strokeWidth={2} />
                  <AppText variant="caption" style={{ color: colors.text.inverse }}>
                    Complete Quest
                  </AppText>
                </View>
              )}
            </Button>
          </View>
        )}

        {/* Processing Overlay */}
        {(isCompleting || isDeleting) && (
          <View style={[styles.processingOverlay, { backgroundColor: colors.background + 'CC' }]}>
            <AppText variant="caption" color="muted">
              {isCompleting ? 'Completing quest...' : 'Deleting quest...'}
            </AppText>
          </View>
        )}
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: Spacing.md,
    position: 'relative',
  },
  featuredCard: {
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  processingCard: {
    opacity: 0.7,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  categoryContainer: {
    flex: 1,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
  },
  categoryText: {
    fontSize: 10,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
  },
  quickActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  quickActionButton: {
    minHeight: 'auto',
    width: 32,
    height: 32,
    borderRadius: 16,
    paddingHorizontal: 0,
    paddingVertical: 0,
    shadowOpacity: 0,
    elevation: 0,
    backgroundColor: 'transparent',
  },
  deleteButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  content: {
    marginBottom: Spacing.lg,
  },
  title: {
    marginBottom: Spacing.sm,
  },
  description: {
    lineHeight: 22,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flexWrap: 'wrap',
    marginBottom: Spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    gap: 2,
  },
  mainAction: {
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  completeButton: {
    width: '100%',
  },
  actionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.xl,
  },
});
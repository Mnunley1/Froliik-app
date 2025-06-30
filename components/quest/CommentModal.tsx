import { AppText } from '@/components/ui/Typography';
import { BorderRadius, Spacing } from '@/constants/colors';
import { useThemeColors } from '@/hooks/useColorScheme';
import { useCommunityComments } from '@/hooks/useQuestGeneration';
import { useQuery } from 'convex/react';
import { MessageCircle, Send, Trash2, Users, X } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { api } from '../../convex/_generated/api';

interface Comment {
  _id: string;
  userId: string;
  content: string;
  timestamp: number;
  user?: {
    _id: string;
    fullName?: string;
    username?: string;
    avatar?: string;
    level?: number;
  };
}

interface CommentModalProps {
  visible: boolean;
  onClose: () => void;
  updateId: string;
  userId?: string;
  updateTitle: string;
}

export function CommentModal({
  visible,
  onClose,
  updateId,
  userId,
  updateTitle,
}: CommentModalProps) {
  const colors = useThemeColors();
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addComment, deleteComment } = useCommunityComments();

  // Get comments for this update
  const comments = useQuery(api.quests.getComments, {
    updateId: updateId as any,
    limit: 50,
  });

  const handleSubmitComment = async () => {
    if (!userId || !commentText.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await addComment(updateId, userId, commentText.trim());
      setCommentText('');
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!userId) return;

    try {
      await deleteComment(commentId, userId);
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const renderUserAvatar = (user?: Comment['user']) => {
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
        <Users size={16} color={colors.primary} strokeWidth={2} />
      </View>
    );
  };

  const renderComment = ({ item }: { item: Comment }) => {
    const isOwnComment = item.userId === userId;
    const canDelete = isOwnComment;

    return (
      <View style={styles.commentItem}>
        <View style={styles.commentHeader}>
          <View style={styles.commentUserInfo}>
            {renderUserAvatar(item.user)}
            <View style={styles.commentUserDetails}>
              <AppText variant="body" style={styles.commentUserName}>
                {item.user?.fullName || item.user?.username || 'User'}
              </AppText>
              {item.user?.level && (
                <AppText variant="caption" color="muted">
                  Level {item.user.level}
                </AppText>
              )}
            </View>
          </View>
          {canDelete && (
            <TouchableOpacity
              onPress={() => handleDeleteComment(item._id)}
              style={styles.deleteButton}
            >
              <Trash2 size={14} color={colors.error} strokeWidth={2} />
            </TouchableOpacity>
          )}
        </View>
        <AppText variant="body" style={styles.commentContent}>
          {item.content}
        </AppText>
        <AppText variant="caption" color="muted" style={styles.commentTime}>
          {formatTimestamp(item.timestamp)}
        </AppText>
      </View>
    );
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

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: colors.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={colors.text.primary} strokeWidth={2} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <AppText variant="h3" style={styles.headerTitle}>
              Comments
            </AppText>
            <AppText variant="caption" color="muted" numberOfLines={1}>
              {updateTitle}
            </AppText>
          </View>
        </View>

        {/* Comments List */}
        <FlatList
          data={comments || []}
          keyExtractor={(item) => item._id}
          renderItem={renderComment}
          style={styles.commentsList}
          contentContainerStyle={styles.commentsContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <MessageCircle size={48} color={colors.text.muted} />
              <AppText variant="body" color="muted" align="center">
                No comments yet
              </AppText>
              <AppText variant="caption" color="muted" align="center">
                Be the first to comment!
              </AppText>
            </View>
          }
        />

        {/* Comment Input */}
        <View
          style={[styles.inputContainer, { borderTopColor: colors.border }]}
        >
          <TextInput
            style={[
              styles.textInput,
              {
                backgroundColor: colors.surface,
                color: colors.text.primary,
                borderColor: colors.border,
              },
            ]}
            placeholder="Add a comment..."
            placeholderTextColor={colors.text.muted}
            value={commentText}
            onChangeText={setCommentText}
            multiline
            maxLength={500}
            editable={!isSubmitting}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              {
                backgroundColor: commentText.trim()
                  ? colors.primary
                  : colors.surface,
                opacity: commentText.trim() && !isSubmitting ? 1 : 0.5,
              },
            ]}
            onPress={handleSubmitComment}
            disabled={!commentText.trim() || isSubmitting}
          >
            <Send size={20} color={colors.background} strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  closeButton: {
    padding: Spacing.sm,
    marginRight: Spacing.sm,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    marginBottom: Spacing.xs,
  },
  commentsList: {
    flex: 1,
  },
  commentsContent: {
    padding: Spacing.lg,
  },
  commentItem: {
    marginBottom: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  commentUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  commentUserDetails: {
    flex: 1,
  },
  commentUserName: {
    fontWeight: '600',
  },
  deleteButton: {
    padding: Spacing.xs,
  },
  commentContent: {
    marginBottom: Spacing.xs,
    lineHeight: 20,
  },
  commentTime: {
    fontSize: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.xxxl,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    gap: Spacing.sm,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    maxHeight: 100,
    minHeight: 40,
    textAlignVertical: 'top',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

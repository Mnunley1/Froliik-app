import { useMutation, useQuery } from 'convex/react';
import { useCallback, useState } from 'react';
import { api } from '../convex/_generated/api';
import {
  QuestGenerationService,
  QuestGenerationUtils,
} from '../lib/questGeneration';

export interface QuestGenerationRequest {
  userId: string;
  forceGenerate?: boolean;
  specificCategory?: string;
}

export interface QuestGenerationResult {
  success: boolean;
  questId?: string;
  error?: string;
  category?: string;
  difficulty?: string;
}

interface UseQuestGenerationReturn {
  isGenerating: boolean;
  generateQuest: (
    request: QuestGenerationRequest,
  ) => Promise<QuestGenerationResult>;
  generateFirstQuest: (userId: string) => Promise<QuestGenerationResult>;
  shouldGenerateQuest: (userId: string) => Promise<boolean>;
  getQuestGenerationStatus: (userId: string) => Promise<any>;
  getAvailableCategories: () => string[];
  getDifficultyLevels: () => Array<'gentle' | 'moderate' | 'adventurous'>;
  formatGenerationTime: (timestamp: number) => string;
}

/**
 * Hook for quest generation functionality
 */
export function useQuestGeneration(): UseQuestGenerationReturn {
  const [isGenerating, setIsGenerating] = useState(false);
  const currentUser = useQuery(api.users.current);
  const generateQuestMutation = useMutation(
    api.questGeneration.generateUserQuest,
  );
  const generateFirstQuestMutation = useMutation(
    api.questGeneration.generateFirstQuest,
  );
  const shouldGenerateQuestQuery = useQuery(
    api.questGeneration.shouldGenerateQuest,
    currentUser?._id ? { userId: currentUser._id } : 'skip',
  );
  const questGenerationStatusQuery = useQuery(
    api.questGeneration.getQuestGenerationStatus,
    currentUser?._id ? { userId: currentUser._id } : 'skip',
  );

  const generateQuest = useCallback(
    async ({
      category,
      userId,
    }: {
      category?: string;
      userId?: string;
    }): Promise<QuestGenerationResult> => {
      if (isGenerating) {
        return { success: false, error: 'Already generating a quest' };
      }

      setIsGenerating(true);

      try {
        const targetUserId = userId || currentUser?._id;

        if (!targetUserId) {
          throw new Error('No user ID available for quest generation');
        }

        const result = await QuestGenerationService.generateQuest(
          {
            userId: targetUserId as any,
            category,
          },
          generateQuestMutation,
        );

        return result;
      } catch (error) {
        console.error('Error generating quest:', error);
        return {
          success: false,
          error:
            error instanceof Error ? error.message : 'Failed to generate quest',
        };
      } finally {
        setIsGenerating(false);
      }
    },
    [isGenerating, currentUser?._id, generateQuestMutation],
  );

  const generateFirstQuest = useCallback(
    async (userId: string): Promise<QuestGenerationResult> => {
      if (!currentUser?._id) {
        return {
          success: false,
          error: 'User not authenticated',
        };
      }

      setIsGenerating(true);
      try {
        const result = await QuestGenerationService.generateFirstQuest(
          currentUser._id as any,
          generateFirstQuestMutation,
        );

        return result;
      } catch (error) {
        console.error('Error generating first quest:', error);
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : 'Failed to generate first quest',
        };
      } finally {
        setIsGenerating(false);
      }
    },
    [currentUser?._id, generateFirstQuestMutation],
  );

  const shouldGenerateQuest = useCallback(
    async (userId: string): Promise<boolean> => {
      try {
        return await QuestGenerationService.shouldGenerateQuest(
          userId as any,
          shouldGenerateQuestQuery,
        );
      } catch (error) {
        console.error('Error checking if should generate quest:', error);
        return false;
      }
    },
    [shouldGenerateQuestQuery],
  );

  const getQuestGenerationStatus = useCallback(
    async (userId: string): Promise<any> => {
      try {
        return await QuestGenerationService.getQuestGenerationStatus(
          userId as any,
          questGenerationStatusQuery,
        );
      } catch (error) {
        console.error('Error getting quest generation status:', error);
        return {
          onboardingCompleted: false,
          questGenerationEnabled: false,
          questGenerationPaused: true,
          hasActiveQuests: false,
          activeQuestCount: 0,
          lastQuestTime: null,
          canGenerate: false,
        };
      }
    },
    [questGenerationStatusQuery],
  );

  return {
    isGenerating,
    generateQuest,
    generateFirstQuest,
    shouldGenerateQuest,
    getQuestGenerationStatus,
    getAvailableCategories: QuestGenerationUtils.getAvailableCategories,
    getDifficultyLevels: QuestGenerationUtils.getDifficultyLevels,
    formatGenerationTime: QuestGenerationUtils.formatGenerationTime,
  };
}

export const useCommunityLikes = () => {
  const likeUpdate = useMutation(api.quests.likeCommunityUpdate);
  const unlikeUpdate = useMutation(api.quests.unlikeCommunityUpdate);

  const handleLike = async (updateId: string, userId: string) => {
    try {
      await likeUpdate({
        updateId: updateId as any,
        userId: userId as any,
      });
    } catch (error) {
      console.error('Error liking update:', error);
      throw error;
    }
  };

  const handleUnlike = async (updateId: string, userId: string) => {
    try {
      await unlikeUpdate({
        updateId: updateId as any,
        userId: userId as any,
      });
    } catch (error) {
      console.error('Error unliking update:', error);
      throw error;
    }
  };

  return {
    likeUpdate: handleLike,
    unlikeUpdate: handleUnlike,
  };
};

export const useCommunityComments = () => {
  const addCommentMutation = useMutation(api.quests.addComment);
  const deleteCommentMutation = useMutation(api.quests.deleteComment);

  const addComment = async (
    updateId: string,
    userId: string,
    content: string,
  ) => {
    try {
      await addCommentMutation({
        updateId: updateId as any,
        userId: userId as any,
        content,
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  };

  const deleteComment = async (commentId: string, userId: string) => {
    try {
      await deleteCommentMutation({
        commentId: commentId as any,
        userId: userId as any,
      });
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  };

  return {
    addComment,
    deleteComment,
  };
};

import { Id } from '../convex/_generated/dataModel';

export interface QuestGenerationOptions {
  userId: Id<'users'>;
  category?: string;
  difficulty?: 'gentle' | 'moderate' | 'adventurous';
  forceGenerate?: boolean;
}

export interface QuestGenerationResult {
  success: boolean;
  questId?: Id<'sideQuests'>;
  error?: string;
  category?: string;
  difficulty?: string;
}

/**
 * Quest Generation Service
 *
 * Provides a unified interface for quest generation functionality
 */
export class QuestGenerationService {
  /**
   * Generate a quest for a user
   */
  static async generateQuest(
    options: QuestGenerationOptions,
    convexMutation: any,
  ): Promise<QuestGenerationResult> {
    try {
      const result = await convexMutation({
        userId: options.userId,
        specificCategory: options.category,
        forceGenerate: options.forceGenerate,
      });

      return {
        success: result.success,
        questId: result.questId,
        error: result.error,
        category: result.category,
        difficulty: result.difficulty,
      };
    } catch (error) {
      console.error('Error generating quest:', error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Generate the first quest for a new user
   */
  static async generateFirstQuest(
    userId: Id<'users'>,
    convexMutation: any,
  ): Promise<QuestGenerationResult> {
    try {
      const result = await convexMutation({
        userId,
      });

      return {
        success: result.success,
        questId: result.questId,
        error: result.error,
        category: result.category,
        difficulty: result.difficulty,
      };
    } catch (error) {
      console.error('Error generating first quest:', error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Check if a quest should be generated
   */
  static async shouldGenerateQuest(
    userId: Id<'users'>,
    convexQuery: any,
  ): Promise<boolean> {
    try {
      return await convexQuery({ userId });
    } catch (error) {
      console.error('Error checking if should generate quest:', error);
      return false;
    }
  }

  /**
   * Get quest generation status
   */
  static async getQuestGenerationStatus(
    userId: Id<'users'>,
    convexQuery: any,
  ): Promise<any> {
    try {
      return await convexQuery({ userId });
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
  }
}

/**
 * Quest Generation Utilities
 */
export class QuestGenerationUtils {
  /**
   * Get a random category from a list
   */
  static getRandomCategory(categories: string[]): string {
    if (categories.length === 0) return 'mindfulness';
    const randomIndex = Math.floor(Math.random() * categories.length);
    return categories[randomIndex];
  }

  /**
   * Get available quest categories
   */
  static getAvailableCategories(): string[] {
    return [
      'mindfulness',
      'creativity',
      'movement',
      'learning',
      'connection',
      'productivity',
      'adventure',
      'community',
    ];
  }

  /**
   * Get difficulty levels
   */
  static getDifficultyLevels(): Array<'gentle' | 'moderate' | 'adventurous'> {
    return ['gentle', 'moderate', 'adventurous'];
  }

  /**
   * Format quest generation time
   */
  static formatGenerationTime(timestamp: number): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60),
    );

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }
  }
}

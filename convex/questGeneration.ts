import { v } from 'convex/values';
import { Id } from './_generated/dataModel';
import { mutation, query } from './_generated/server';

export interface QuestGenerationRequest {
  userId: Id<'users'>;
  forceGenerate?: boolean;
  specificCategory?: string;
}

export interface QuestGenerationResult {
  success: boolean;
  questId?: Id<'sideQuests'>;
  error?: string;
  category?: string;
  difficulty?: string;
}

/**
 * Generate a quest based on user preferences
 */
export const generateUserQuest = mutation({
  args: {
    userId: v.id('users'),
    forceGenerate: v.optional(v.boolean()),
    specificCategory: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    try {
      console.log('🎯 Starting quest generation for user:', args.userId);

      // Check if user has completed onboarding (unless force generating)
      if (!args.forceGenerate) {
        const user = await ctx.db.get(args.userId);
        if (!user?.onboardingCompleted) {
          console.log(
            '⏸️ Quest generation skipped - user has not completed onboarding',
          );
          return {
            success: false,
            error:
              'User must complete onboarding before quests can be generated',
          };
        }
      }

      // Get user settings
      const userSettings = await ctx.db
        .query('userSettings')
        .withIndex('by_user_id', (q) => q.eq('userId', args.userId))
        .first();

      // Check if quests are paused
      if (userSettings?.settings?.questPreferences?.paused) {
        console.log('⏸️ Quest generation is paused for user');
        return {
          success: false,
          error: 'Quest generation is paused',
        };
      }

      // Check if auto-generation is enabled
      if (!userSettings?.settings?.questPreferences?.autoGenerateQuests) {
        console.log('⏸️ Quest auto-generation is disabled for user');
        return {
          success: false,
          error: 'Quest auto-generation is disabled',
        };
      }

      // Determine category to use
      let selectedCategory: string;

      if (args.specificCategory) {
        selectedCategory = args.specificCategory;
      } else {
        // Select from user's preferred categories
        const preferredCategories =
          userSettings?.settings?.questPreferences?.preferredCategories || [];

        if (preferredCategories.length === 0) {
          // Fallback to default categories if none selected
          selectedCategory = getRandomCategory([
            'mindfulness',
            'creativity',
            'movement',
            'learning',
            'connection',
          ]);
        } else {
          selectedCategory = getRandomCategory(preferredCategories);
        }
      }

      console.log('📂 Selected category:', selectedCategory);

      // Get user's preferred difficulty
      const difficulty =
        userSettings?.settings?.questPreferences?.defaultDifficulty ||
        'moderate';

      // Generate quest using AI (simplified for now)
      const questDescription = generateQuestDescription(
        selectedCategory,
        difficulty,
      );

      // Create quest title based on category
      const questTitle = createQuestTitle(selectedCategory);

      // Save quest to database
      const questId = await ctx.db.insert('sideQuests', {
        userId: args.userId,
        title: questTitle,
        description: questDescription,
        completed: false,
        difficultyLevel: difficulty,
        questGiver: 'AI Quest Generator',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      console.log('✅ Quest generated successfully:', {
        id: questId,
        category: selectedCategory,
        difficulty,
        title: questTitle,
      });

      return {
        success: true,
        questId,
        category: selectedCategory,
        difficulty,
      };
    } catch (error) {
      console.error('💥 Error in quest generation:', error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  },
});

/**
 * Generate the first quest for a new user (after onboarding)
 */
export const generateFirstQuest = mutation({
  args: {
    userId: v.id('users'),
  },
  handler: async (ctx, args) => {
    console.log(
      '🎉 Generating first quest for new user after onboarding:',
      args.userId,
    );

    // Get user settings to use their preferences
    const userSettings = await ctx.db
      .query('userSettings')
      .withIndex('by_user_id', (q) => q.eq('userId', args.userId))
      .first();

    // Use user's preferred categories and difficulty, or fallback to defaults
    const preferredCategories = userSettings?.settings?.questPreferences
      ?.preferredCategories || ['mindfulness'];
    const difficulty =
      userSettings?.settings?.questPreferences?.defaultDifficulty || 'gentle';

    const selectedCategory = getRandomCategory(preferredCategories);

    const questTitle = createQuestTitle(selectedCategory);
    const questDescription = generateQuestDescription(
      selectedCategory,
      difficulty,
    );

    // Save quest to database
    const questId = await ctx.db.insert('sideQuests', {
      userId: args.userId,
      title: questTitle,
      description: questDescription,
      completed: false,
      difficultyLevel: difficulty,
      questGiver: 'AI Quest Generator',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return {
      success: true,
      questId,
      category: selectedCategory,
      difficulty,
    };
  },
});

/**
 * Check if a quest should be generated for a user based on their preferences
 */
export const shouldGenerateQuest = query({
  args: {
    userId: v.id('users'),
  },
  handler: async (ctx, args) => {
    try {
      // Get user settings
      const userSettings = await ctx.db
        .query('userSettings')
        .withIndex('by_user_id', (q) => q.eq('userId', args.userId))
        .first();

      if (!userSettings) {
        return false;
      }

      // Check if quest generation is paused
      if (userSettings.settings?.questPreferences?.paused) {
        return false;
      }

      // Check if auto-generation is enabled
      if (!userSettings.settings?.questPreferences?.autoGenerateQuests) {
        return false;
      }

      // Get user to check onboarding completion
      const user = await ctx.db.get(args.userId);
      if (!user?.onboardingCompleted) {
        return false;
      }

      // Get the last quest generation time
      const lastQuest = await ctx.db
        .query('sideQuests')
        .withIndex('by_user_id', (q) => q.eq('userId', args.userId))
        .order('desc')
        .first();

      if (!lastQuest) {
        // No quests yet, should generate
        return true;
      }

      // Check if enough time has passed since last quest
      const timeSinceLastQuest = Date.now() - lastQuest.createdAt;
      const minInterval = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

      return timeSinceLastQuest >= minInterval;
    } catch (error) {
      console.error('Error checking if should generate quest:', error);
      return false;
    }
  },
});

/**
 * Check if user has active quests
 */
export const hasActiveQuests = query({
  args: {
    userId: v.id('users'),
  },
  handler: async (ctx, args) => {
    try {
      const activeQuests = await ctx.db
        .query('sideQuests')
        .withIndex('by_user_completed', (q) =>
          q.eq('userId', args.userId).eq('completed', false),
        )
        .collect();

      return activeQuests.length > 0;
    } catch (error) {
      console.error('Error checking active quests:', error);
      return false;
    }
  },
});

/**
 * Get quest generation status for a user
 */
export const getQuestGenerationStatus = query({
  args: {
    userId: v.id('users'),
  },
  handler: async (ctx, args) => {
    try {
      const userSettings = await ctx.db
        .query('userSettings')
        .withIndex('by_user_id', (q) => q.eq('userId', args.userId))
        .first();

      const user = await ctx.db.get(args.userId);
      const hasActive = await ctx.db
        .query('sideQuests')
        .withIndex('by_user_completed', (q) =>
          q.eq('userId', args.userId).eq('completed', false),
        )
        .collect();

      const shouldGenerate = await ctx.db
        .query('sideQuests')
        .withIndex('by_user_id', (q) => q.eq('userId', args.userId))
        .order('desc')
        .first();

      return {
        onboardingCompleted: user?.onboardingCompleted || false,
        questGenerationEnabled:
          userSettings?.settings?.questPreferences?.autoGenerateQuests || false,
        questGenerationPaused:
          userSettings?.settings?.questPreferences?.paused || false,
        hasActiveQuests: hasActive.length > 0,
        activeQuestCount: hasActive.length,
        lastQuestTime: shouldGenerate?.createdAt || null,
        canGenerate:
          !userSettings?.settings?.questPreferences?.paused &&
          userSettings?.settings?.questPreferences?.autoGenerateQuests &&
          user?.onboardingCompleted &&
          hasActive.length === 0,
      };
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
});

/**
 * Mark that a quest has been generated for the user
 */
export const markQuestGenerated = mutation({
  args: {
    userId: v.id('users'),
  },
  handler: async (ctx, args) => {
    // This function can be used to track quest generation timing
    // For now, we'll just log it
    console.log('Quest generation marked for user:', args.userId);
  },
});

// Helper functions
function getRandomCategory(categories: string[]): string {
  const randomIndex = Math.floor(Math.random() * categories.length);
  return categories[randomIndex];
}

function createQuestTitle(category: string): string {
  const titles = {
    mindfulness: [
      'Mindful Moment',
      'Inner Peace Journey',
      'Present Awareness',
      'Calm Reflection',
      'Mindful Breathing',
    ],
    creativity: [
      'Creative Spark',
      'Artistic Expression',
      'Imaginative Adventure',
      'Creative Flow',
      'Artistic Discovery',
    ],
    movement: [
      'Body Movement',
      'Physical Adventure',
      'Active Exploration',
      'Movement Journey',
      'Physical Challenge',
    ],
    learning: [
      'Knowledge Quest',
      'Learning Adventure',
      'Skill Building',
      'Educational Journey',
      'Discovery Mission',
    ],
    connection: [
      'Social Connection',
      'Relationship Building',
      'Community Engagement',
      'Connection Quest',
      'Social Adventure',
    ],
    productivity: [
      'Productivity Boost',
      'Efficiency Quest',
      'Organization Mission',
      'Focus Challenge',
      'Workflow Optimization',
    ],
    adventure: [
      'Adventure Quest',
      'Exploration Mission',
      'Discovery Journey',
      'New Experience',
      'Bold Adventure',
    ],
    community: [
      'Community Service',
      'Helping Hands',
      'Giving Back',
      'Support Mission',
      'Community Connection',
    ],
  };

  const categoryTitles =
    titles[category as keyof typeof titles] || titles.mindfulness;
  return getRandomCategory(categoryTitles);
}

function generateQuestDescription(
  category: string,
  difficulty: string,
): string {
  // Enhanced quest description generation based on category and difficulty
  const descriptions = {
    mindfulness: {
      gentle: 'Take a moment to practice mindfulness and find inner peace.',
      moderate:
        'Create a mindful space and practice deep breathing for 10 minutes.',
      adventurous:
        'Try a new meditation technique and explore your inner landscape.',
    },
    creativity: {
      gentle:
        'Express your creativity through art, writing, or other creative activities.',
      moderate:
        'Start a creative project and spend 30 minutes exploring your artistic side.',
      adventurous:
        'Challenge yourself with a completely new creative medium or technique.',
    },
    movement: {
      gentle:
        'Get your body moving with some gentle physical activity or stretching.',
      moderate:
        'Engage in 20 minutes of physical activity that gets your heart rate up.',
      adventurous:
        "Try a new form of exercise or physical challenge you've never done before.",
    },
    learning: {
      gentle:
        'Learn something new or expand your knowledge in an area of interest.',
      moderate:
        "Dive deep into a topic you're curious about for at least 30 minutes.",
      adventurous:
        'Master a new skill or concept that challenges your current abilities.',
    },
    connection: {
      gentle:
        'Connect with others, build relationships, or strengthen existing bonds.',
      moderate:
        "Reach out to someone you haven't talked to recently and have a meaningful conversation.",
      adventurous:
        'Join a new social group or attend an event to meet new people.',
    },
    productivity: {
      gentle: 'Organize one small area of your workspace or living space.',
      moderate: 'Implement a new productivity system or workflow improvement.',
      adventurous:
        'Take on a challenging project that pushes your organizational skills.',
    },
    adventure: {
      gentle:
        'Explore a new place or try something slightly outside your comfort zone.',
      moderate: 'Plan and execute a mini-adventure in your local area.',
      adventurous:
        'Embark on a bold new experience that challenges your boundaries.',
    },
    community: {
      gentle: 'Do something kind for someone in your community.',
      moderate: 'Volunteer your time or skills to help others.',
      adventurous:
        'Take on a leadership role in a community project or initiative.',
    },
  };

  const categoryDescriptions =
    descriptions[category as keyof typeof descriptions];
  if (categoryDescriptions) {
    return (
      categoryDescriptions[difficulty as keyof typeof categoryDescriptions] ||
      categoryDescriptions.moderate
    );
  }

  return descriptions.mindfulness.moderate;
}

export function getAvailableCategories(): string[] {
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

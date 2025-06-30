import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

// Enhanced default settings structure with onboarding-specific structure
export const defaultUserSettings = {
  notifications: {
    enabled: true,
    questReminders: true,
    communityUpdates: true,
    achievements: true,
  },
  privacy: {
    shareCompletedQuests: true,
    showProfileInCommunity: true,
  },
  questPreferences: {
    preferredCategories: [], // Will be populated during onboarding
    defaultDifficulty: 'moderate',
    dailyQuestLimit: 5,
    autoGenerateQuests: false, // Disabled until onboarding complete
    paused: true, // Paused until onboarding complete
    // Enhanced quest preferences
    aiPreferences: {
      preferredDuration: '15-30 minutes',
      preferredLocation: 'anywhere',
      preferredTimeOfDay: 'anytime',
      interests: [], // Will be populated during onboarding
      accessibility: 'standard',
      energyLevel: 'moderate',
    },
    duplicatePrevention: {
      enabled: true,
      similarityThreshold: 0.7,
      checkLastNDays: 30,
      maxRetries: 3,
    },
  },
  appPreferences: {
    theme: 'system', // 'light', 'dark', 'system'
    language: 'en',
  },
  // Onboarding tracking
  onboarding: {
    completed: false,
    step1Completed: false, // Interests selected
    step2Completed: false, // Goals selected
    step3Completed: false, // Name entered
    interests: [], // From step 1
    goals: [], // From step 2
    fullName: '', // From step 3
  },
};

// Minimal initial settings for new users
export const minimalUserSettings = {
  notifications: {
    enabled: true,
    questReminders: true,
    communityUpdates: true,
    achievements: true,
  },
  privacy: {
    shareCompletedQuests: true,
    showProfileInCommunity: true,
  },
  questPreferences: {
    preferredCategories: [], // Empty until onboarding
    defaultDifficulty: 'moderate',
    dailyQuestLimit: 5,
    autoGenerateQuests: false, // Disabled until onboarding complete
    paused: true, // Paused until onboarding complete
    aiPreferences: {
      preferredDuration: '15-30 minutes',
      preferredLocation: 'anywhere',
      preferredTimeOfDay: 'anytime',
      interests: [],
      accessibility: 'standard',
      energyLevel: 'moderate',
    },
    duplicatePrevention: {
      enabled: true,
      similarityThreshold: 0.7,
      checkLastNDays: 30,
      maxRetries: 3,
    },
  },
  appPreferences: {
    theme: 'system',
    language: 'en',
  },
  onboarding: {
    completed: false,
    step1Completed: false,
    step2Completed: false,
    step3Completed: false,
    interests: [],
    goals: [],
    fullName: '',
  },
};

export const getUserSettings = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const settings = await ctx.db
      .query('userSettings')
      .withIndex('by_user_id', (q) => q.eq('userId', args.userId))
      .first();

    if (!settings) {
      // Return default settings if none exist
      return defaultUserSettings;
    }

    // Merge with defaults to ensure all properties exist
    return {
      ...defaultUserSettings,
      ...settings.settings,
    };
  },
});

// Progressive settings creation
export const createInitialUserSettings = mutation({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const existingSettings = await ctx.db
      .query('userSettings')
      .withIndex('by_user_id', (q) => q.eq('userId', args.userId))
      .first();

    if (existingSettings) {
      return existingSettings._id;
    }

    // Create minimal initial settings
    const settingsId = await ctx.db.insert('userSettings', {
      userId: args.userId,
      settings: minimalUserSettings,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      version: 1,
    });

    console.log(`✅ Created initial user settings for: ${args.userId}`);
    return settingsId;
  },
});

// Update onboarding progress
export const updateOnboardingStep = mutation({
  args: {
    userId: v.id('users'),
    step: v.union(v.literal('step1'), v.literal('step2'), v.literal('step3')),
    data: v.any(),
  },
  handler: async (ctx, args) => {
    const existingSettings = await ctx.db
      .query('userSettings')
      .withIndex('by_user_id', (q) => q.eq('userId', args.userId))
      .first();

    if (!existingSettings) {
      throw new Error('User settings not found');
    }

    const currentSettings = existingSettings.settings;
    let updatedSettings = { ...currentSettings };

    switch (args.step) {
      case 'step1':
        // Update interests and mark step 1 complete
        updatedSettings = {
          ...currentSettings,
          onboarding: {
            ...currentSettings.onboarding,
            step1Completed: true,
            interests: args.data.interests || [],
          },
          questPreferences: {
            ...currentSettings.questPreferences,
            preferredCategories: mapInterestsToCategories(
              args.data.interests || [],
            ),
            aiPreferences: {
              ...currentSettings.questPreferences.aiPreferences,
              interests: args.data.interests || [],
            },
          },
        };
        break;

      case 'step2':
        // Update quest level and mark step 2 complete
        updatedSettings = {
          ...currentSettings,
          onboarding: {
            ...currentSettings.onboarding,
            step2Completed: true,
            questLevel: args.data.questLevel || 'moderate',
          },
          questPreferences: {
            ...currentSettings.questPreferences,
            defaultDifficulty: mapQuestLevelToDifficulty(
              args.data.questLevel || 'moderate',
            ),
          },
        };
        break;

      case 'step3':
        // Update name and mark onboarding complete
        updatedSettings = {
          ...currentSettings,
          onboarding: {
            ...currentSettings.onboarding,
            step3Completed: true,
            completed: true,
            fullName: args.data.fullName || '',
          },
        };
        break;
    }

    await ctx.db.patch(existingSettings._id, {
      settings: updatedSettings,
      updatedAt: Date.now(),
    });

    console.log(
      `✅ Updated onboarding step ${args.step} for user: ${args.userId}`,
    );
    return existingSettings._id;
  },
});

export const createUserSettings = mutation({
  args: {
    userId: v.id('users'),
    settings: v.any(),
  },
  handler: async (ctx, args) => {
    const existingSettings = await ctx.db
      .query('userSettings')
      .withIndex('by_user_id', (q) => q.eq('userId', args.userId))
      .first();

    if (existingSettings) {
      throw new Error('User settings already exist');
    }

    const settingsId = await ctx.db.insert('userSettings', {
      userId: args.userId,
      settings: args.settings,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      version: 1,
    });

    return settingsId;
  },
});

export const updateUserSettings = mutation({
  args: {
    userId: v.id('users'),
    settings: v.any(),
  },
  handler: async (ctx, args) => {
    const existingSettings = await ctx.db
      .query('userSettings')
      .withIndex('by_user_id', (q) => q.eq('userId', args.userId))
      .first();

    if (!existingSettings) {
      // Create new settings if they don't exist
      return await ctx.db.insert('userSettings', {
        userId: args.userId,
        settings: args.settings,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        version: 1,
      });
    }

    // Update existing settings
    await ctx.db.patch(existingSettings._id, {
      settings: args.settings,
      updatedAt: Date.now(),
    });

    return existingSettings._id;
  },
});

export const updateNotificationSettings = mutation({
  args: {
    userId: v.id('users'),
    notifications: v.any(),
  },
  handler: async (ctx, args) => {
    const existingSettings = await ctx.db
      .query('userSettings')
      .withIndex('by_user_id', (q) => q.eq('userId', args.userId))
      .first();

    if (!existingSettings) {
      // Create new settings with just notifications
      return await ctx.db.insert('userSettings', {
        userId: args.userId,
        settings: {
          ...defaultUserSettings,
          notifications: args.notifications,
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),
        version: 1,
      });
    }

    // Update existing settings
    const updatedSettings = {
      ...existingSettings.settings,
      notifications: {
        ...existingSettings.settings.notifications,
        ...args.notifications,
      },
    };

    await ctx.db.patch(existingSettings._id, {
      settings: updatedSettings,
      updatedAt: Date.now(),
    });

    return existingSettings._id;
  },
});

export const updateQuestPreferences = mutation({
  args: {
    userId: v.id('users'),
    questPreferences: v.any(),
  },
  handler: async (ctx, args) => {
    const existingSettings = await ctx.db
      .query('userSettings')
      .withIndex('by_user_id', (q) => q.eq('userId', args.userId))
      .first();

    if (!existingSettings) {
      // Create new settings with just quest preferences
      return await ctx.db.insert('userSettings', {
        userId: args.userId,
        settings: {
          ...defaultUserSettings,
          questPreferences: args.questPreferences,
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),
        version: 1,
      });
    }

    // Update existing settings
    const updatedSettings = {
      ...existingSettings.settings,
      questPreferences: {
        ...existingSettings.settings.questPreferences,
        ...args.questPreferences,
      },
    };

    await ctx.db.patch(existingSettings._id, {
      settings: updatedSettings,
      updatedAt: Date.now(),
    });

    return existingSettings._id;
  },
});

export const updatePrivacySettings = mutation({
  args: {
    userId: v.id('users'),
    privacy: v.any(),
  },
  handler: async (ctx, args) => {
    const existingSettings = await ctx.db
      .query('userSettings')
      .withIndex('by_user_id', (q) => q.eq('userId', args.userId))
      .first();

    if (!existingSettings) {
      // Create new settings with just privacy settings
      return await ctx.db.insert('userSettings', {
        userId: args.userId,
        settings: {
          ...defaultUserSettings,
          privacy: args.privacy,
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),
        version: 1,
      });
    }

    // Update existing settings
    const updatedSettings = {
      ...existingSettings.settings,
      privacy: {
        ...existingSettings.settings.privacy,
        ...args.privacy,
      },
    };

    await ctx.db.patch(existingSettings._id, {
      settings: updatedSettings,
      updatedAt: Date.now(),
    });

    return existingSettings._id;
  },
});

export const updateAppPreferences = mutation({
  args: {
    userId: v.id('users'),
    appPreferences: v.any(),
  },
  handler: async (ctx, args) => {
    const existingSettings = await ctx.db
      .query('userSettings')
      .withIndex('by_user_id', (q) => q.eq('userId', args.userId))
      .first();

    if (!existingSettings) {
      // Create new settings with just app preferences
      return await ctx.db.insert('userSettings', {
        userId: args.userId,
        settings: {
          ...defaultUserSettings,
          appPreferences: args.appPreferences,
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),
        version: 1,
      });
    }

    // Update existing settings
    const updatedSettings = {
      ...existingSettings.settings,
      appPreferences: {
        ...existingSettings.settings.appPreferences,
        ...args.appPreferences,
      },
    };

    await ctx.db.patch(existingSettings._id, {
      settings: updatedSettings,
      updatedAt: Date.now(),
    });

    return existingSettings._id;
  },
});

export const deleteUserSettings = mutation({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const settings = await ctx.db
      .query('userSettings')
      .withIndex('by_user_id', (q) => q.eq('userId', args.userId))
      .first();

    if (settings) {
      await ctx.db.delete(settings._id);
    }
  },
});

// Utility functions for getting specific setting values
export const getSettingValue = query({
  args: {
    userId: v.id('users'),
    key: v.string(),
    defaultValue: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const settings = await ctx.db
      .query('userSettings')
      .withIndex('by_user_id', (q) => q.eq('userId', args.userId))
      .first();

    if (!settings || typeof settings.settings !== 'object') {
      return args.defaultValue || null;
    }

    const keys = args.key.split('.');
    let value = settings.settings;

    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return args.defaultValue || null;
      }
    }

    return value !== undefined ? value : args.defaultValue || null;
  },
});

export const ensureUserSettingsExist = mutation({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const existingSettings = await ctx.db
      .query('userSettings')
      .withIndex('by_user_id', (q) => q.eq('userId', args.userId))
      .first();

    if (existingSettings) {
      return existingSettings._id;
    }

    // Create default settings if they don't exist
    const settingsId = await ctx.db.insert('userSettings', {
      userId: args.userId,
      settings: defaultUserSettings,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      version: 1,
    });

    return settingsId;
  },
});

// Helper functions for mapping onboarding data to settings
function mapInterestsToCategories(interests: string[]): string[] {
  const interestToCategoryMap: Record<string, string> = {
    mindfulness: 'mindfulness',
    productivity: 'productivity',
    health: 'movement',
    learning: 'learning',
    creativity: 'creativity',
    social: 'connection',
    growth: 'mindfulness',
    adventure: 'adventure',
  };

  const categories = interests
    .map((interest) => interestToCategoryMap[interest])
    .filter(Boolean);

  // Ensure we have at least some categories
  return categories.length > 0
    ? categories
    : ['mindfulness', 'creativity', 'movement'];
}

function mapQuestLevelToDifficulty(
  questLevel: string,
): 'gentle' | 'moderate' | 'adventurous' {
  const levelToDifficultyMap: Record<
    string,
    'gentle' | 'moderate' | 'adventurous'
  > = {
    gentle: 'gentle',
    balanced: 'moderate',
    moderate: 'moderate',
    adventurous: 'adventurous',
  };

  return levelToDifficultyMap[questLevel] || 'moderate';
}

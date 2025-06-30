import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  users: defineTable({
    email: v.string(),
    fullName: v.optional(v.string()),
    externalId: v.string(),
    onboardingCompleted: v.optional(v.boolean()),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
    // Community profile fields
    username: v.optional(v.string()),
    avatar: v.optional(v.string()),
    bio: v.optional(v.string()),
    level: v.optional(v.number()),
    totalPoints: v.optional(v.number()),
    questsCompleted: v.optional(v.number()),
    isPublic: v.optional(v.boolean()),
  })
    .index('by_email', ['email'])
    .index('byExternalId', ['externalId'])
    .index('by_created_at', ['createdAt'])
    .index('by_username', ['username'])
    .index('by_level', ['level'])
    .index('by_points', ['totalPoints']),

  sideQuests: defineTable({
    userId: v.id('users'),
    title: v.string(),
    description: v.optional(v.string()),
    completed: v.boolean(),
    reward: v.optional(v.string()),
    difficultyLevel: v.optional(v.string()),
    prerequisites: v.optional(v.array(v.string())),
    questGiver: v.optional(v.string()),
    location: v.optional(v.string()),
    timeLimit: v.optional(v.string()), // Store as ISO string
    createdAt: v.number(),
    updatedAt: v.number(),
    // Community features
    isPublic: v.optional(v.boolean()),
    likes: v.optional(v.number()),
    shares: v.optional(v.number()),
    completionTime: v.optional(v.number()), // in minutes
  })
    .index('by_user_id', ['userId'])
    .index('by_user_completed', ['userId', 'completed'])
    .index('by_completed', ['completed'])
    .index('by_created_at', ['createdAt'])
    .index('by_updated_at', ['updatedAt'])
    .index('by_public', ['isPublic'])
    .index('by_likes', ['likes']),

  userSettings: defineTable({
    userId: v.id('users'),
    settings: v.any(), // JSON object for flexible settings
    createdAt: v.number(),
    updatedAt: v.number(),
    version: v.optional(v.number()), // For settings migrations
  })
    .index('by_user_id', ['userId'])
    .index('by_updated_at', ['updatedAt'])
    .index('by_version', ['version']), // For settings migrations

  communityUpdates: defineTable({
    userId: v.id('users'),
    userName: v.string(),
    userEmail: v.string(),
    action: v.union(
      v.literal('completed'),
      v.literal('created'),
      v.literal('shared'),
      v.literal('achievement'),
      v.literal('level_up'),
    ),
    questTitle: v.string(),
    questCategory: v.optional(v.string()),
    achievement: v.optional(v.string()),
    timestamp: v.number(),
    // Enhanced community features
    questId: v.optional(v.id('sideQuests')),
    points: v.optional(v.number()),
    level: v.optional(v.number()),
    likes: v.optional(v.number()),
    comments: v.optional(v.number()),
  })
    .index('by_timestamp', ['timestamp'])
    .index('by_user_id', ['userId'])
    .index('by_action', ['action'])
    .index('by_quest_id', ['questId'])
    .index('by_likes', ['likes']),

  // New tables for enhanced community features
  achievements: defineTable({
    userId: v.id('users'),
    title: v.string(),
    description: v.string(),
    icon: v.string(),
    category: v.string(),
    rarity: v.union(
      v.literal('common'),
      v.literal('rare'),
      v.literal('epic'),
      v.literal('legendary'),
    ),
    unlockedAt: v.number(),
    points: v.number(),
  })
    .index('by_user_id', ['userId'])
    .index('by_category', ['category'])
    .index('by_rarity', ['rarity'])
    .index('by_unlocked_at', ['unlockedAt']),

  socialInteractions: defineTable({
    userId: v.id('users'), // User performing the action
    targetUserId: v.optional(v.id('users')), // User being acted upon
    targetQuestId: v.optional(v.id('sideQuests')), // Quest being acted upon
    targetUpdateId: v.optional(v.id('communityUpdates')), // Update being acted upon
    action: v.union(
      v.literal('like'),
      v.literal('follow'),
      v.literal('comment'),
      v.literal('share'),
    ),
    content: v.optional(v.string()), // For comments
    timestamp: v.number(),
  })
    .index('by_user_id', ['userId'])
    .index('by_target_user_id', ['targetUserId'])
    .index('by_target_quest_id', ['targetQuestId'])
    .index('by_target_update_id', ['targetUpdateId'])
    .index('by_action', ['action'])
    .index('by_timestamp', ['timestamp']),

  userStats: defineTable({
    userId: v.id('users'),
    totalQuestsCompleted: v.number(),
    totalPoints: v.number(),
    currentStreak: v.number(),
    longestStreak: v.number(),
    totalPlayTime: v.number(), // in minutes
    favoriteCategory: v.optional(v.string()),
    achievementsUnlocked: v.number(),
    level: v.number(),
    experience: v.number(),
    lastActive: v.number(),
  })
    .index('by_user_id', ['userId'])
    .index('by_points', ['totalPoints'])
    .index('by_level', ['level'])
    .index('by_streak', ['currentStreak']),

  leaderboards: defineTable({
    period: v.union(
      v.literal('daily'),
      v.literal('weekly'),
      v.literal('monthly'),
      v.literal('all_time'),
    ),
    category: v.optional(v.string()),
    entries: v.array(
      v.object({
        userId: v.id('users'),
        userName: v.string(),
        points: v.number(),
        rank: v.number(),
      }),
    ),
    lastUpdated: v.number(),
  })
    .index('by_period', ['period'])
    .index('by_category', ['category'])
    .index('by_last_updated', ['lastUpdated']),

  inAppNotifications: defineTable({
    userId: v.id('users'),
    title: v.string(),
    message: v.string(),
    type: v.union(
      v.literal('success'),
      v.literal('error'),
      v.literal('warning'),
      v.literal('info'),
    ),
    read: v.boolean(),
    createdAt: v.number(),
    expiresAt: v.optional(v.number()),
  })
    .index('by_user_id', ['userId'])
    .index('by_created_at', ['createdAt'])
    .index('by_read_status', ['read']),
});

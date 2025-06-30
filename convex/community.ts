import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

// ===== USER PROFILES =====

export const updateUserProfile = mutation({
  args: {
    userId: v.id('users'),
    username: v.optional(v.string()),
    bio: v.optional(v.string()),
    avatar: v.optional(v.string()),
    isPublic: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { userId, ...updates } = args;

    // Check if username is already taken
    if (updates.username) {
      const existingUser = await ctx.db
        .query('users')
        .withIndex('by_username', (q) => q.eq('username', updates.username!))
        .first();

      if (existingUser && existingUser._id !== userId) {
        throw new Error('Username already taken');
      }
    }

    await ctx.db.patch(userId, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

export const getUserProfile = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error('User not found');

    // Get user stats
    const stats = await ctx.db
      .query('userStats')
      .withIndex('by_user_id', (q) => q.eq('userId', args.userId))
      .first();

    // Get recent achievements
    const achievements = await ctx.db
      .query('achievements')
      .withIndex('by_user_id', (q) => q.eq('userId', args.userId))
      .order('desc')
      .take(5);

    // Get recent activity
    const recentActivity = await ctx.db
      .query('communityUpdates')
      .withIndex('by_user_id', (q) => q.eq('userId', args.userId))
      .order('desc')
      .take(10);

    return {
      user,
      stats: stats || {
        totalQuestsCompleted: 0,
        totalPoints: 0,
        currentStreak: 0,
        longestStreak: 0,
        totalPlayTime: 0,
        achievementsUnlocked: 0,
        level: 1,
        experience: 0,
        lastActive: Date.now(),
      },
      achievements,
      recentActivity,
    };
  },
});

export const getPublicProfiles = query({
  args: {
    limit: v.optional(v.number()),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;

    const users = await ctx.db
      .query('users')
      .filter((q) => q.eq(q.field('isPublic'), true))
      .order('desc')
      .take(limit);

    // Get stats for each user
    const profilesWithStats = await Promise.all(
      users.map(async (user) => {
        const stats = await ctx.db
          .query('userStats')
          .withIndex('by_user_id', (q) => q.eq('userId', user._id))
          .first();

        return {
          ...user,
          stats: stats || {
            totalQuestsCompleted: 0,
            totalPoints: 0,
            currentStreak: 0,
            longestStreak: 0,
            totalPlayTime: 0,
            achievementsUnlocked: 0,
            level: 1,
            experience: 0,
            lastActive: Date.now(),
          },
        };
      }),
    );

    return profilesWithStats;
  },
});

// ===== SOCIAL INTERACTIONS =====

export const likeQuest = mutation({
  args: {
    userId: v.id('users'),
    questId: v.id('sideQuests'),
  },
  handler: async (ctx, args) => {
    // Check if already liked
    const existingLike = await ctx.db
      .query('socialInteractions')
      .withIndex('by_user_id', (q) => q.eq('userId', args.userId))
      .filter((q) =>
        q.and(
          q.eq(q.field('action'), 'like'),
          q.eq(q.field('targetQuestId'), args.questId),
        ),
      )
      .first();

    if (existingLike) {
      // Unlike
      await ctx.db.delete(existingLike._id);

      // Decrease quest likes
      const quest = await ctx.db.get(args.questId);
      if (quest) {
        await ctx.db.patch(args.questId, {
          likes: Math.max(0, (quest.likes || 0) - 1),
        });
      }
    } else {
      // Like
      await ctx.db.insert('socialInteractions', {
        userId: args.userId,
        targetQuestId: args.questId,
        action: 'like',
        timestamp: Date.now(),
      });

      // Increase quest likes
      const quest = await ctx.db.get(args.questId);
      if (quest) {
        await ctx.db.patch(args.questId, {
          likes: (quest.likes || 0) + 1,
        });
      }
    }
  },
});

export const likeCommunityUpdate = mutation({
  args: {
    userId: v.id('users'),
    updateId: v.id('communityUpdates'),
  },
  handler: async (ctx, args) => {
    // Check if already liked
    const existingLike = await ctx.db
      .query('socialInteractions')
      .withIndex('by_user_id', (q) => q.eq('userId', args.userId))
      .filter((q) =>
        q.and(
          q.eq(q.field('action'), 'like'),
          q.eq(q.field('targetUpdateId'), args.updateId),
        ),
      )
      .first();

    if (existingLike) {
      // Unlike
      await ctx.db.delete(existingLike._id);

      // Decrease update likes
      const update = await ctx.db.get(args.updateId);
      if (update) {
        await ctx.db.patch(args.updateId, {
          likes: Math.max(0, (update.likes || 0) - 1),
        });
      }
    } else {
      // Like
      await ctx.db.insert('socialInteractions', {
        userId: args.userId,
        targetUpdateId: args.updateId,
        action: 'like',
        timestamp: Date.now(),
      });

      // Increase update likes
      const update = await ctx.db.get(args.updateId);
      if (update) {
        await ctx.db.patch(args.updateId, {
          likes: (update.likes || 0) + 1,
        });
      }
    }
  },
});

export const commentOnQuest = mutation({
  args: {
    userId: v.id('users'),
    questId: v.id('sideQuests'),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert('socialInteractions', {
      userId: args.userId,
      targetQuestId: args.questId,
      action: 'comment',
      content: args.content,
      timestamp: Date.now(),
    });
  },
});

export const commentOnUpdate = mutation({
  args: {
    userId: v.id('users'),
    updateId: v.id('communityUpdates'),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert('socialInteractions', {
      userId: args.userId,
      targetUpdateId: args.updateId,
      action: 'comment',
      content: args.content,
      timestamp: Date.now(),
    });

    // Increase comment count
    const update = await ctx.db.get(args.updateId);
    if (update) {
      await ctx.db.patch(args.updateId, {
        comments: (update.comments || 0) + 1,
      });
    }
  },
});

// ===== ACHIEVEMENTS =====

export const unlockAchievement = mutation({
  args: {
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
    points: v.number(),
  },
  handler: async (ctx, args) => {
    // Check if achievement already unlocked
    const existingAchievement = await ctx.db
      .query('achievements')
      .withIndex('by_user_id', (q) => q.eq('userId', args.userId))
      .filter((q) => q.eq(q.field('title'), args.title))
      .first();

    if (existingAchievement) {
      return existingAchievement._id;
    }

    const achievementId = await ctx.db.insert('achievements', {
      userId: args.userId,
      title: args.title,
      description: args.description,
      icon: args.icon,
      category: args.category,
      rarity: args.rarity,
      unlockedAt: Date.now(),
      points: args.points,
    });

    // Update user stats
    const stats = await ctx.db
      .query('userStats')
      .withIndex('by_user_id', (q) => q.eq('userId', args.userId))
      .first();

    if (stats) {
      await ctx.db.patch(stats._id, {
        achievementsUnlocked: stats.achievementsUnlocked + 1,
        totalPoints: stats.totalPoints + args.points,
      });
    }

    // Create community update for achievement
    await ctx.db.insert('communityUpdates', {
      userId: args.userId,
      userName: 'User', // Will be updated with actual user name
      userEmail: 'user@example.com', // Will be updated with actual email
      action: 'achievement',
      questTitle: args.title,
      questCategory: args.category,
      achievement: args.title,
      points: args.points,
      timestamp: Date.now(),
    });

    return achievementId;
  },
});

export const getUserAchievements = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const achievements = await ctx.db
      .query('achievements')
      .withIndex('by_user_id', (q) => q.eq('userId', args.userId))
      .order('desc')
      .collect();

    return achievements;
  },
});

// ===== LEADERBOARDS =====

export const getLeaderboard = query({
  args: {
    period: v.union(
      v.literal('daily'),
      v.literal('weekly'),
      v.literal('monthly'),
      v.literal('all_time'),
    ),
    category: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;

    // For now, calculate leaderboard directly from user stats
    // In production, you'd want to cache this in the leaderboards table
    const stats = await ctx.db.query('userStats').order('desc').collect();

    const entries = stats.slice(0, limit).map((stat, index) => ({
      userId: stat.userId,
      userName: 'User', // Will be updated with actual user name
      points: stat.totalPoints,
      rank: index + 1,
    }));

    return {
      period: args.period,
      category: args.category,
      entries,
      lastUpdated: Date.now(),
    };
  },
});

export const updateLeaderboard = mutation({
  args: {
    period: v.union(
      v.literal('daily'),
      v.literal('weekly'),
      v.literal('monthly'),
      v.literal('all_time'),
    ),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const stats = await ctx.db.query('userStats').order('desc').collect();

    const entries = stats.slice(0, 50).map((stat, index) => ({
      userId: stat.userId,
      userName: 'User', // Will be updated with actual user name
      points: stat.totalPoints,
      rank: index + 1,
    }));

    // Check if leaderboard exists
    const existingLeaderboard = await ctx.db
      .query('leaderboards')
      .withIndex('by_period', (q) => q.eq('period', args.period))
      .filter((q) =>
        args.category
          ? q.eq(q.field('category'), args.category)
          : q.eq(q.field('category'), undefined),
      )
      .first();

    if (existingLeaderboard) {
      await ctx.db.patch(existingLeaderboard._id, {
        entries,
        lastUpdated: Date.now(),
      });
    } else {
      await ctx.db.insert('leaderboards', {
        period: args.period,
        category: args.category,
        entries,
        lastUpdated: Date.now(),
      });
    }
  },
});

// ===== ENHANCED COMMUNITY UPDATES =====

export const getEnhancedCommunityUpdates = query({
  args: {
    limit: v.optional(v.number()),
    category: v.optional(v.string()),
    action: v.optional(
      v.union(
        v.literal('completed'),
        v.literal('created'),
        v.literal('shared'),
        v.literal('achievement'),
        v.literal('level_up'),
      ),
    ),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;

    let query = ctx.db.query('communityUpdates');

    if (args.category) {
      query = query.filter((q) =>
        q.eq(q.field('questCategory'), args.category),
      );
    }

    if (args.action) {
      query = query.filter((q) => q.eq(q.field('action'), args.action));
    }

    const updates = await query
      .withIndex('by_timestamp', (q) => q.gte('timestamp', 0))
      .order('desc')
      .take(limit);

    // Get user details for each update
    const updatesWithUserDetails = await Promise.all(
      updates.map(async (update) => {
        const user = await ctx.db.get(update.userId);
        return {
          ...update,
          user: user
            ? {
                _id: user._id,
                fullName: user.fullName,
                username: user.username,
                avatar: user.avatar,
                level: user.level,
              }
            : null,
        };
      }),
    );

    return updatesWithUserDetails;
  },
});

export const getUserFeed = query({
  args: {
    userId: v.id('users'),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;

    // Get updates from users the current user follows
    // For now, return all public updates
    const updates = await ctx.db
      .query('communityUpdates')
      .withIndex('by_timestamp', (q) => q.gte('timestamp', 0))
      .order('desc')
      .take(limit);

    // Get user details and interaction status
    const updatesWithDetails = await Promise.all(
      updates.map(async (update) => {
        const user = await ctx.db.get(update.userId);

        // Check if current user has interacted with this update
        const userLike = await ctx.db
          .query('socialInteractions')
          .withIndex('by_user_id', (q) => q.eq('userId', args.userId))
          .filter((q) =>
            q.and(
              q.eq(q.field('action'), 'like'),
              q.eq(q.field('targetUpdateId'), update._id),
            ),
          )
          .first();

        return {
          ...update,
          user: user
            ? {
                _id: user._id,
                fullName: user.fullName,
                username: user.username,
                avatar: user.avatar,
                level: user.level,
              }
            : null,
          isLiked: !!userLike,
        };
      }),
    );

    return updatesWithDetails;
  },
});

// ===== USER STATS MANAGEMENT =====

export const updateUserStats = mutation({
  args: {
    userId: v.id('users'),
    questCompleted: v.optional(v.boolean()),
    points: v.optional(v.number()),
    playTime: v.optional(v.number()), // in minutes
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let stats = await ctx.db
      .query('userStats')
      .withIndex('by_user_id', (q) => q.eq('userId', args.userId))
      .first();

    if (!stats) {
      // Create new stats record
      const statsId = await ctx.db.insert('userStats', {
        userId: args.userId,
        totalQuestsCompleted: args.questCompleted ? 1 : 0,
        totalPoints: args.points || 0,
        currentStreak: 0,
        longestStreak: 0,
        totalPlayTime: args.playTime || 0,
        favoriteCategory: args.category,
        achievementsUnlocked: 0,
        level: 1,
        experience: 0,
        lastActive: Date.now(),
      });
      stats = await ctx.db.get(statsId);
    }

    if (!stats) throw new Error('Failed to create or retrieve user stats');

    const updates: any = {
      lastActive: Date.now(),
    };

    if (args.questCompleted) {
      updates.totalQuestsCompleted = stats.totalQuestsCompleted + 1;
      // Update streak logic here
      updates.currentStreak = stats.currentStreak + 1;
      if (updates.currentStreak > stats.longestStreak) {
        updates.longestStreak = updates.currentStreak;
      }
    }

    if (args.points) {
      updates.totalPoints = stats.totalPoints + args.points;
      updates.experience = stats.experience + args.points;

      // Level up logic
      const newLevel = Math.floor(updates.experience / 100) + 1;
      if (newLevel > stats.level) {
        updates.level = newLevel;

        // Create level up community update
        await ctx.db.insert('communityUpdates', {
          userId: args.userId,
          userName: 'User',
          userEmail: 'user@example.com',
          action: 'level_up',
          questTitle: `Reached Level ${newLevel}!`,
          questCategory: 'achievement',
          points: args.points,
          level: newLevel,
          timestamp: Date.now(),
        });
      }
    }

    if (args.playTime) {
      updates.totalPlayTime = stats.totalPlayTime + args.playTime;
    }

    if (args.category) {
      updates.favoriteCategory = args.category;
    }

    await ctx.db.patch(stats._id, updates);
  },
});

// ===== UTILITY FUNCTIONS =====

export const getCommunityStats = query({
  args: {},
  handler: async (ctx) => {
    const totalUsers = await ctx.db.query('users').collect();
    const totalQuests = await ctx.db.query('sideQuests').collect();
    const completedQuests = totalQuests.filter((q) => q.completed);
    const totalAchievements = await ctx.db.query('achievements').collect();

    return {
      totalUsers: totalUsers.length,
      totalQuests: totalQuests.length,
      completedQuests: completedQuests.length,
      totalAchievements: totalAchievements.length,
      completionRate:
        totalQuests.length > 0
          ? (completedQuests.length / totalQuests.length) * 100
          : 0,
    };
  },
});

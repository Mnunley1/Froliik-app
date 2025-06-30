import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

export const createSideQuest = mutation({
  args: {
    userId: v.id('users'),
    title: v.string(),
    description: v.optional(v.string()),
    reward: v.optional(v.string()),
    difficultyLevel: v.optional(v.string()),
    prerequisites: v.optional(v.array(v.string())),
    questGiver: v.optional(v.string()),
    location: v.optional(v.string()),
    timeLimit: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const questId = await ctx.db.insert('sideQuests', {
      userId: args.userId,
      title: args.title,
      description: args.description,
      completed: false,
      reward: args.reward,
      difficultyLevel: args.difficultyLevel,
      prerequisites: args.prerequisites,
      questGiver: args.questGiver,
      location: args.location,
      timeLimit: args.timeLimit,
      createdAt: now,
      updatedAt: now,
    });

    // Create community update for quest creation
    await ctx.db.insert('communityUpdates', {
      userId: args.userId,
      userName: 'User', // Will be updated with actual user name
      userEmail: 'user@example.com', // Will be updated with actual email
      action: 'created',
      questTitle: args.title,
      questCategory: args.difficultyLevel || 'general',
      timestamp: now,
    });

    return questId;
  },
});

export const getUserSideQuests = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const quests = await ctx.db
      .query('sideQuests')
      .withIndex('by_user_id', (q) => q.eq('userId', args.userId))
      .order('desc')
      .collect();

    return quests;
  },
});

export const getActiveSideQuests = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const quests = await ctx.db
      .query('sideQuests')
      .withIndex('by_user_completed', (q) =>
        q.eq('userId', args.userId).eq('completed', false),
      )
      .order('desc')
      .collect();

    return quests;
  },
});

export const getCompletedSideQuests = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const quests = await ctx.db
      .query('sideQuests')
      .withIndex('by_user_completed', (q) =>
        q.eq('userId', args.userId).eq('completed', true),
      )
      .order('desc')
      .collect();

    return quests;
  },
});

export const completeSideQuest = mutation({
  args: {
    questId: v.id('sideQuests'),
    userId: v.id('users'),
  },
  handler: async (ctx, args) => {
    const quest = await ctx.db.get(args.questId);
    if (!quest || quest.userId !== args.userId) {
      throw new Error('Quest not found or access denied');
    }

    await ctx.db.patch(args.questId, {
      completed: true,
      updatedAt: Date.now(),
    });

    // Get user info for community update
    const user = await ctx.db.get(args.userId);
    const userName = user?.fullName || user?.username || 'Adventurer';

    // Create community update for quest completion
    await ctx.db.insert('communityUpdates', {
      userId: args.userId,
      userName,
      userEmail: user?.email || 'user@example.com',
      action: 'completed',
      questTitle: quest.title,
      questCategory: quest.difficultyLevel || 'general',
      achievement: `Completed ${quest.title}`,
      timestamp: Date.now(),
      questId: args.questId,
      points: 10, // Base points for quest completion
    });

    // Update user stats
    let userStats = await ctx.db
      .query('userStats')
      .withIndex('by_user_id', (q) => q.eq('userId', args.userId))
      .first();

    if (!userStats) {
      // Create new user stats record
      await ctx.db.insert('userStats', {
        userId: args.userId,
        totalQuestsCompleted: 1,
        totalPoints: 10,
        currentStreak: 1,
        longestStreak: 1,
        totalPlayTime: 0,
        achievementsUnlocked: 0,
        level: 1,
        experience: 10,
        lastActive: Date.now(),
      });
    } else {
      // Update existing user stats
      const newTotalQuests = userStats.totalQuestsCompleted + 1;
      const newTotalPoints = userStats.totalPoints + 10;
      const newExperience = userStats.experience + 10;
      const newLevel = Math.floor(newExperience / 100) + 1;

      // Update streak (simplified logic)
      const newStreak = userStats.currentStreak + 1;
      const newLongestStreak = Math.max(newStreak, userStats.longestStreak);

      await ctx.db.patch(userStats._id, {
        totalQuestsCompleted: newTotalQuests,
        totalPoints: newTotalPoints,
        currentStreak: newStreak,
        longestStreak: newLongestStreak,
        experience: newExperience,
        level: newLevel,
        lastActive: Date.now(),
      });

      // Check for level up
      if (newLevel > userStats.level) {
        await ctx.db.insert('communityUpdates', {
          userId: args.userId,
          userName,
          userEmail: user?.email || 'user@example.com',
          action: 'level_up',
          questTitle: `Reached Level ${newLevel}!`,
          questCategory: 'achievement',
          points: newLevel * 10,
          level: newLevel,
          timestamp: Date.now(),
        });
      }

      // Check for achievements
      if (newTotalQuests === 1) {
        // First quest achievement
        await ctx.db.insert('achievements', {
          userId: args.userId,
          title: 'First Quest',
          description: 'Complete your first quest',
          icon: 'trophy',
          category: 'milestone',
          rarity: 'common',
          unlockedAt: Date.now(),
          points: 10,
        });

        await ctx.db.patch(userStats._id, {
          achievementsUnlocked: userStats.achievementsUnlocked + 1,
        });
      }

      if (newStreak === 7) {
        // 7-day streak achievement
        await ctx.db.insert('achievements', {
          userId: args.userId,
          title: 'Streak Master',
          description: 'Complete 7 quests in a row',
          icon: 'zap',
          category: 'streak',
          rarity: 'rare',
          unlockedAt: Date.now(),
          points: 50,
        });

        await ctx.db.patch(userStats._id, {
          achievementsUnlocked: userStats.achievementsUnlocked + 1,
          totalPoints: newTotalPoints + 50,
        });
      }
    }
  },
});

export const deleteSideQuest = mutation({
  args: {
    questId: v.id('sideQuests'),
    userId: v.id('users'),
  },
  handler: async (ctx, args) => {
    const quest = await ctx.db.get(args.questId);
    if (!quest || quest.userId !== args.userId) {
      throw new Error('Quest not found or access denied');
    }

    await ctx.db.delete(args.questId);
  },
});

export const updateSideQuest = mutation({
  args: {
    questId: v.id('sideQuests'),
    userId: v.id('users'),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    reward: v.optional(v.string()),
    difficultyLevel: v.optional(v.string()),
    prerequisites: v.optional(v.array(v.string())),
    questGiver: v.optional(v.string()),
    location: v.optional(v.string()),
    timeLimit: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { questId, userId, ...updates } = args;

    const quest = await ctx.db.get(questId);
    if (!quest || quest.userId !== userId) {
      throw new Error('Quest not found or access denied');
    }

    await ctx.db.patch(questId, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

export const getCommunityUpdates = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;

    const updates = await ctx.db
      .query('communityUpdates')
      .withIndex('by_timestamp', (q) => q.gte('timestamp', 0))
      .order('desc')
      .take(limit);

    return updates;
  },
});

export const getUserRecentActivity = query({
  args: {
    userId: v.id('users'),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 5;

    const updates = await ctx.db
      .query('communityUpdates')
      .withIndex('by_user_id', (q) => q.eq('userId', args.userId))
      .order('desc')
      .take(limit);

    return updates;
  },
});

export const likeCommunityUpdate = mutation({
  args: {
    updateId: v.id('communityUpdates'),
    userId: v.id('users'),
  },
  handler: async (ctx, args) => {
    // Check if user already liked this update
    const existingLike = await ctx.db
      .query('socialInteractions')
      .withIndex('by_user_id', (q) => q.eq('userId', args.userId))
      .filter(
        (q) =>
          q.eq(q.field('action'), 'like') &&
          q.eq(q.field('targetUpdateId'), args.updateId),
      )
      .first();

    if (existingLike) {
      throw new Error('User already liked this update');
    }

    // Create the like interaction
    await ctx.db.insert('socialInteractions', {
      userId: args.userId,
      targetUpdateId: args.updateId,
      action: 'like',
      timestamp: Date.now(),
    });

    // Update the community update's like count
    const update = await ctx.db.get(args.updateId);
    if (update) {
      const currentLikes = update.likes || 0;
      await ctx.db.patch(args.updateId, {
        likes: currentLikes + 1,
      });
    }
  },
});

export const unlikeCommunityUpdate = mutation({
  args: {
    updateId: v.id('communityUpdates'),
    userId: v.id('users'),
  },
  handler: async (ctx, args) => {
    // Find and delete the like interaction
    const existingLike = await ctx.db
      .query('socialInteractions')
      .withIndex('by_user_id', (q) => q.eq('userId', args.userId))
      .filter(
        (q) =>
          q.eq(q.field('action'), 'like') &&
          q.eq(q.field('targetUpdateId'), args.updateId),
      )
      .first();

    if (!existingLike) {
      throw new Error('User has not liked this update');
    }

    // Delete the like interaction
    await ctx.db.delete(existingLike._id);

    // Update the community update's like count
    const update = await ctx.db.get(args.updateId);
    if (update) {
      const currentLikes = update.likes || 0;
      await ctx.db.patch(args.updateId, {
        likes: Math.max(0, currentLikes - 1),
      });
    }
  },
});

export const getCommunityUpdatesWithLikes = query({
  args: {
    limit: v.optional(v.number()),
    userId: v.optional(v.id('users')),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;

    const updates = await ctx.db
      .query('communityUpdates')
      .withIndex('by_timestamp', (q) => q.gte('timestamp', 0))
      .order('desc')
      .take(limit);

    // If userId is provided, check which updates the user has liked
    if (args.userId) {
      const userLikes = await ctx.db
        .query('socialInteractions')
        .withIndex('by_user_id', (q) => q.eq('userId', args.userId!))
        .filter((q) => q.eq(q.field('action'), 'like'))
        .collect();

      const likedUpdateIds = new Set(
        userLikes.map((like) => like.targetUpdateId).filter(Boolean),
      );

      return updates.map((update) => ({
        ...update,
        isLiked: likedUpdateIds.has(update._id),
      }));
    }

    return updates;
  },
});

export const addComment = mutation({
  args: {
    updateId: v.id('communityUpdates'),
    userId: v.id('users'),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    // Validate comment content
    if (!args.content.trim()) {
      throw new Error('Comment cannot be empty');
    }

    if (args.content.length > 500) {
      throw new Error('Comment too long (max 500 characters)');
    }

    // Get user info for the comment
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Create the comment interaction
    await ctx.db.insert('socialInteractions', {
      userId: args.userId,
      targetUpdateId: args.updateId,
      action: 'comment',
      content: args.content.trim(),
      timestamp: Date.now(),
    });

    // Update the community update's comment count
    const update = await ctx.db.get(args.updateId);
    if (update) {
      const currentComments = update.comments || 0;
      await ctx.db.patch(args.updateId, {
        comments: currentComments + 1,
      });
    }
  },
});

export const deleteComment = mutation({
  args: {
    commentId: v.id('socialInteractions'),
    userId: v.id('users'),
  },
  handler: async (ctx, args) => {
    const comment = await ctx.db.get(args.commentId);
    if (!comment) {
      throw new Error('Comment not found');
    }

    // Only allow users to delete their own comments
    if (comment.userId !== args.userId) {
      throw new Error("Cannot delete another user's comment");
    }

    // Delete the comment
    await ctx.db.delete(args.commentId);

    // Update the community update's comment count
    if (comment.targetUpdateId) {
      const update = await ctx.db.get(comment.targetUpdateId);
      if (update) {
        const currentComments = update.comments || 0;
        await ctx.db.patch(comment.targetUpdateId, {
          comments: Math.max(0, currentComments - 1),
        });
      }
    }
  },
});

export const getComments = query({
  args: {
    updateId: v.id('communityUpdates'),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;

    const comments = await ctx.db
      .query('socialInteractions')
      .withIndex('by_target_update_id', (q) =>
        q.eq('targetUpdateId', args.updateId),
      )
      .filter((q) => q.eq(q.field('action'), 'comment'))
      .order('desc')
      .take(limit);

    // Get user details for each comment
    const commentsWithUsers = await Promise.all(
      comments.map(async (comment) => {
        const user = await ctx.db.get(comment.userId);
        return {
          ...comment,
          user: {
            _id: comment.userId,
            fullName: user?.fullName,
            username: user?.username,
            avatar: user?.avatar,
            level: user?.level,
          },
        };
      }),
    );

    return commentsWithUsers;
  },
});

export const getCommunityUpdatesWithComments = query({
  args: {
    limit: v.optional(v.number()),
    userId: v.optional(v.id('users')),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;

    const updates = await ctx.db
      .query('communityUpdates')
      .withIndex('by_timestamp', (q) => q.gte('timestamp', 0))
      .order('desc')
      .take(limit);

    // If userId is provided, check which updates the user has liked
    if (args.userId) {
      const userLikes = await ctx.db
        .query('socialInteractions')
        .withIndex('by_user_id', (q) => q.eq('userId', args.userId!))
        .filter((q) => q.eq(q.field('action'), 'like'))
        .collect();

      const likedUpdateIds = new Set(
        userLikes.map((like) => like.targetUpdateId).filter(Boolean),
      );

      return updates.map((update) => ({
        ...update,
        isLiked: likedUpdateIds.has(update._id),
      }));
    }

    return updates;
  },
});

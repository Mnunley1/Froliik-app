import { v } from 'convex/values';
import { Id } from './_generated/dataModel';
import { mutation, query } from './_generated/server';

export interface NotificationData {
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  action?: {
    label: string;
    onPress: () => void;
  };
}

export interface InAppNotification {
  _id: Id<'inAppNotifications'>;
  userId: Id<'users'>;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  read: boolean;
  createdAt: number;
  expiresAt?: number;
}

export const createInAppNotification = mutation({
  args: {
    userId: v.id('users'),
    title: v.string(),
    message: v.string(),
    type: v.union(
      v.literal('success'),
      v.literal('error'),
      v.literal('warning'),
      v.literal('info'),
    ),
    duration: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const expiresAt = args.duration ? Date.now() + args.duration : undefined;

    const notificationId = await ctx.db.insert('inAppNotifications', {
      userId: args.userId,
      title: args.title,
      message: args.message,
      type: args.type,
      read: false,
      createdAt: Date.now(),
      expiresAt,
    });

    return notificationId;
  },
});

export const getUserNotifications = query({
  args: {
    userId: v.id('users'),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;

    const notifications = await ctx.db
      .query('inAppNotifications')
      .withIndex('by_user_id', (q) => q.eq('userId', args.userId))
      .order('desc')
      .take(limit);

    // Filter out expired notifications
    const now = Date.now();
    return notifications.filter(
      (notification) => !notification.expiresAt || notification.expiresAt > now,
    );
  },
});

export const markNotificationAsRead = mutation({
  args: {
    notificationId: v.id('inAppNotifications'),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.notificationId, {
      read: true,
    });
  },
});

export const markAllNotificationsAsRead = mutation({
  args: {
    userId: v.id('users'),
  },
  handler: async (ctx, args) => {
    const notifications = await ctx.db
      .query('inAppNotifications')
      .withIndex('by_user_id', (q) => q.eq('userId', args.userId))
      .filter((q) => q.eq(q.field('read'), false))
      .collect();

    for (const notification of notifications) {
      await ctx.db.patch(notification._id, {
        read: true,
      });
    }
  },
});

export const deleteNotification = mutation({
  args: {
    notificationId: v.id('inAppNotifications'),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.notificationId);
  },
});

export const deleteExpiredNotifications = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    const expiredNotifications = await ctx.db
      .query('inAppNotifications')
      .filter((q) =>
        q.and(
          q.neq(q.field('expiresAt'), undefined),
          q.lt(q.field('expiresAt'), now),
        ),
      )
      .collect();

    for (const notification of expiredNotifications) {
      await ctx.db.delete(notification._id);
    }

    return expiredNotifications.length;
  },
});

export const getUnreadNotificationCount = query({
  args: {
    userId: v.id('users'),
  },
  handler: async (ctx, args) => {
    const unreadNotifications = await ctx.db
      .query('inAppNotifications')
      .withIndex('by_user_id', (q) => q.eq('userId', args.userId))
      .filter((q) => q.eq(q.field('read'), false))
      .collect();

    // Filter out expired notifications
    const now = Date.now();
    const validUnreadNotifications = unreadNotifications.filter(
      (notification) => !notification.expiresAt || notification.expiresAt > now,
    );

    return validUnreadNotifications.length;
  },
});

// Quest-specific notifications
export const createQuestCompletionNotification = mutation({
  args: {
    userId: v.id('users'),
    questTitle: v.string(),
  },
  handler: async (ctx, args) => {
    const notificationId = await ctx.db.insert('inAppNotifications', {
      userId: args.userId,
      title: '🎉 Quest Completed!',
      message: `Congratulations! You've completed "${args.questTitle}". Keep up the great work!`,
      type: 'success',
      read: false,
      createdAt: Date.now(),
      expiresAt: Date.now() + 10000, // 10 seconds
    });

    return notificationId;
  },
});

export const createNewQuestNotification = mutation({
  args: {
    userId: v.id('users'),
    questTitle: v.string(),
    category: v.string(),
  },
  handler: async (ctx, args) => {
    const notificationId = await ctx.db.insert('inAppNotifications', {
      userId: args.userId,
      title: '🌟 New Quest Available!',
      message: `Your ${args.category} adventure is ready: "${args.questTitle}"`,
      type: 'success',
      read: false,
      createdAt: Date.now(),
      expiresAt: Date.now() + 8000, // 8 seconds
    });

    return notificationId;
  },
});

export const createQuestReminderNotification = mutation({
  args: {
    userId: v.id('users'),
  },
  handler: async (ctx, args) => {
    const notificationId = await ctx.db.insert('inAppNotifications', {
      userId: args.userId,
      title: '⏰ Quest Reminder',
      message:
        'You have active quests waiting for you! Time to continue your adventure.',
      type: 'info',
      read: false,
      createdAt: Date.now(),
      expiresAt: Date.now() + 15000, // 15 seconds
    });

    return notificationId;
  },
});

import { UserJSON } from '@clerk/backend';
import { v, Validator } from 'convex/values';
import { internal } from './_generated/api';
import {
  internalMutation,
  mutation,
  query,
  QueryCtx,
} from './_generated/server';

// Import default settings from userSettings
import { minimalUserSettings } from './userSettings';

export const current = query({
  args: {},
  handler: async (ctx) => {
    return await getCurrentUser(ctx);
  },
});

export const upsertFromClerk = internalMutation({
  args: { data: v.any() as Validator<UserJSON> }, // no runtime validation, trust Clerk
  async handler(ctx, { data }) {
    const now = Date.now();
    const userAttributes = {
      email: data.email_addresses?.[0]?.email_address || '',
      fullName:
        `${data.first_name || ''} ${data.last_name || ''}`.trim() || undefined,
      externalId: data.id,
      onboardingCompleted: false,
      createdAt: now,
      updatedAt: now,
    };

    const user = await userByExternalId(ctx, data.id);
    if (user === null) {
      // This is a new user - create user record and minimal settings
      const userId = await ctx.db.insert('users', userAttributes);

      // Create minimal initial settings (not full defaults)
      await ctx.db.insert('userSettings', {
        userId: userId,
        settings: minimalUserSettings,
        createdAt: now,
        updatedAt: now,
        version: 1,
      });

      console.log(`✅ Created new user with minimal settings: ${userId}`);
    } else {
      // This is an existing user - just update the user record
      await ctx.db.patch(user._id, {
        ...userAttributes,
        createdAt: user.createdAt || now, // Preserve original creation time
      });

      console.log(`✅ Updated existing user: ${user._id}`);
    }
  },
});

export const deleteFromClerk = internalMutation({
  args: { clerkUserId: v.string() },
  async handler(ctx, { clerkUserId }) {
    const user = await userByExternalId(ctx, clerkUserId);

    if (user !== null) {
      // Delete all user-related data comprehensively
      await ctx.runMutation(internal.users.deleteUserData, {
        userId: user._id,
      });
    } else {
      console.warn(
        `Can't delete user, there is none for Clerk user ID: ${clerkUserId}`,
      );
    }
  },
});

// Comprehensive function to delete all user-related data
export const deleteUserData = internalMutation({
  args: { userId: v.id('users') },
  async handler(ctx, { userId }) {
    console.log(`🗑️ Starting comprehensive deletion for user: ${userId}`);

    // Delete user settings
    const userSettings = await ctx.db
      .query('userSettings')
      .withIndex('by_user_id', (q) => q.eq('userId', userId))
      .collect();

    for (const setting of userSettings) {
      await ctx.db.delete(setting._id);
      console.log(`🗑️ Deleted user setting: ${setting._id}`);
    }

    // Delete side quests
    const sideQuests = await ctx.db
      .query('sideQuests')
      .withIndex('by_user_id', (q) => q.eq('userId', userId))
      .collect();

    for (const quest of sideQuests) {
      await ctx.db.delete(quest._id);
      console.log(`🗑️ Deleted side quest: ${quest._id}`);
    }

    // Delete community updates
    const communityUpdates = await ctx.db
      .query('communityUpdates')
      .withIndex('by_user_id', (q) => q.eq('userId', userId))
      .collect();

    for (const update of communityUpdates) {
      await ctx.db.delete(update._id);
      console.log(`🗑️ Deleted community update: ${update._id}`);
    }

    // Delete in-app notifications
    const notifications = await ctx.db
      .query('inAppNotifications')
      .withIndex('by_user_id', (q) => q.eq('userId', userId))
      .collect();

    for (const notification of notifications) {
      await ctx.db.delete(notification._id);
      console.log(`🗑️ Deleted notification: ${notification._id}`);
    }

    // Finally, delete the user record itself
    await ctx.db.delete(userId);
    console.log(`🗑️ Deleted user record: ${userId}`);

    console.log(`✅ Comprehensive deletion completed for user: ${userId}`);
  },
});

export async function getCurrentUserOrThrow(ctx: QueryCtx) {
  const userRecord = await getCurrentUser(ctx);
  if (!userRecord) throw new Error("Can't get current user");
  return userRecord;
}

export async function getCurrentUser(ctx: QueryCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (identity === null) {
    return null;
  }
  return await userByExternalId(ctx, identity.subject);
}

async function userByExternalId(ctx: QueryCtx, externalId: string) {
  return await ctx.db
    .query('users')
    .withIndex('byExternalId', (q) => q.eq('externalId', externalId))
    .unique();
}

export const getCurrentUserOnboardingStatus = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', args.email.toLowerCase()))
      .first();

    return user?.onboardingCompleted || false;
  },
});

export const markOnboardingCompleted = mutation({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      onboardingCompleted: true,
      updatedAt: Date.now(),
    });
  },
});

// Client-side mutation to delete user account
export const deleteAccount = mutation({
  args: {},
  async handler(ctx) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    const user = await userByExternalId(ctx, identity.subject);
    if (!user) {
      throw new Error('User not found');
    }

    console.log(`🗑️ Starting account deletion for user: ${user._id}`);

    try {
      // Delete all user-related data from Convex
      await ctx.runMutation(internal.users.deleteUserData, {
        userId: user._id,
      });

      console.log(`✅ Account deletion completed for user: ${user._id}`);

      // Note: The actual Clerk user deletion will be handled by the webhook
      // when Clerk sends the user.deleted event, which will trigger deleteFromClerk
      // This ensures data consistency even if the client-side call fails
    } catch (error) {
      console.error(
        `❌ Error during account deletion for user ${user._id}:`,
        error,
      );
      throw new Error('Failed to delete account data');
    }
  },
});

import { useMutation, useQuery } from 'convex/react';
import { useCallback, useMemo } from 'react';
import { api } from '../convex/_generated/api';

export interface UserSettings {
  notifications: {
    enabled: boolean;
    questReminders: boolean;
    communityUpdates: boolean;
    achievements: boolean;
  };
  privacy: {
    shareCompletedQuests: boolean;
    showProfileInCommunity: boolean;
  };
  questPreferences: {
    preferredCategories: string[];
    defaultDifficulty: 'gentle' | 'moderate' | 'adventurous';
    dailyQuestLimit: number;
    autoGenerateQuests: boolean;
    paused: boolean;
    aiPreferences: {
      preferredDuration: string;
      preferredLocation: string;
      preferredTimeOfDay: string;
      interests: string[];
      accessibility: string;
      energyLevel: string;
    };
    duplicatePrevention: {
      enabled: boolean;
      similarityThreshold: number;
      checkLastNDays: number;
      maxRetries: number;
    };
  };
  appPreferences: {
    theme: 'light' | 'dark' | 'system';
    language: string;
  };
  onboarding: {
    completed: boolean;
    step1Completed: boolean;
    step2Completed: boolean;
    step3Completed: boolean;
    interests: string[];
    goals: string[];
    questLevel: string;
    fullName: string;
  };
}

const defaultUserSettings: UserSettings = {
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
    preferredCategories: [],
    defaultDifficulty: 'moderate',
    dailyQuestLimit: 5,
    autoGenerateQuests: false,
    paused: true,
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
    questLevel: '',
    fullName: '',
  },
};

interface UseUserSettingsReturn {
  settings: UserSettings;
  isLoading: boolean;
  error: string | null;
  updateSettings: (newSettings: Partial<UserSettings>) => Promise<void>;
  updateNotifications: (
    notifications: Partial<UserSettings['notifications']>,
  ) => Promise<void>;
  updateQuestPrefs: (
    questPreferences: Partial<UserSettings['questPreferences']>,
  ) => Promise<void>;
  updatePrivacy: (privacy: Partial<UserSettings['privacy']>) => Promise<void>;
  updateAppPrefs: (
    appPreferences: Partial<UserSettings['appPreferences']>,
  ) => Promise<void>;
  resetToDefaults: () => Promise<void>;
  refreshSettings: () => Promise<void>;
}

export function useUserSettings(): UseUserSettingsReturn {
  const currentUser = useQuery(api.users.current);

  // Mutations for updating settings
  const updateUserSettingsMutation = useMutation(
    api.userSettings.updateUserSettings,
  );
  const updateNotificationsMutation = useMutation(
    api.userSettings.updateNotificationSettings,
  );
  const updateQuestPrefsMutation = useMutation(
    api.userSettings.updateQuestPreferences,
  );
  const updatePrivacyMutation = useMutation(
    api.userSettings.updatePrivacySettings,
  );
  const updateAppPrefsMutation = useMutation(
    api.userSettings.updateAppPreferences,
  );
  const ensureSettingsExistMutation = useMutation(
    api.userSettings.ensureUserSettingsExist,
  );

  // Get user settings using the current user's ID
  const userSettings = useQuery(
    api.userSettings.getUserSettings,
    currentUser?._id ? { userId: currentUser._id } : 'skip',
  );

  // Memoize the settings to prevent unnecessary re-renders
  const settings = useMemo(() => {
    // If we have user settings, use them
    if (userSettings) {
      return userSettings;
    }

    // If the query is still loading (undefined), return default settings
    // but mark as loading so components know to wait
    if (userSettings === undefined) {
      return defaultUserSettings;
    }

    // If userSettings is null (no settings found), create default settings
    return defaultUserSettings;
  }, [userSettings]);

  // Memoize the loading state
  const isLoading = useMemo(() => {
    return currentUser === undefined || userSettings === undefined;
  }, [currentUser, userSettings]);

  // Memoize all the update functions to prevent unnecessary re-renders
  const updateSettings = useCallback(
    async (newSettings: Partial<UserSettings>) => {
      if (!currentUser?._id) {
        throw new Error('User not authenticated');
      }

      // Ensure settings exist before updating
      await ensureSettingsExistMutation({ userId: currentUser._id });

      const updatedSettings = {
        ...(userSettings || defaultUserSettings),
        ...newSettings,
      };

      await updateUserSettingsMutation({
        userId: currentUser._id,
        settings: updatedSettings,
      });
    },
    [
      currentUser?._id,
      userSettings,
      ensureSettingsExistMutation,
      updateUserSettingsMutation,
    ],
  );

  const updateNotifications = useCallback(
    async (notifications: Partial<UserSettings['notifications']>) => {
      if (!currentUser?._id) {
        throw new Error('User not authenticated');
      }

      await updateNotificationsMutation({
        userId: currentUser._id,
        notifications,
      });
    },
    [currentUser?._id, updateNotificationsMutation],
  );

  const updateQuestPrefs = useCallback(
    async (questPreferences: Partial<UserSettings['questPreferences']>) => {
      if (!currentUser?._id) {
        throw new Error('User not authenticated');
      }

      await updateQuestPrefsMutation({
        userId: currentUser._id,
        questPreferences,
      });
    },
    [currentUser?._id, updateQuestPrefsMutation],
  );

  const updatePrivacy = useCallback(
    async (privacy: Partial<UserSettings['privacy']>) => {
      if (!currentUser?._id) {
        throw new Error('User not authenticated');
      }

      await updatePrivacyMutation({
        userId: currentUser._id,
        privacy,
      });
    },
    [currentUser?._id, updatePrivacyMutation],
  );

  const updateAppPrefs = useCallback(
    async (appPreferences: Partial<UserSettings['appPreferences']>) => {
      if (!currentUser?._id) {
        throw new Error('User not authenticated');
      }

      await updateAppPrefsMutation({
        userId: currentUser._id,
        appPreferences,
      });
    },
    [currentUser?._id, updateAppPrefsMutation],
  );

  const resetToDefaults = useCallback(async () => {
    if (!currentUser?._id) {
      throw new Error('User not authenticated');
    }

    await updateUserSettingsMutation({
      userId: currentUser._id,
      settings: defaultUserSettings,
    });
  }, [currentUser?._id, updateUserSettingsMutation]);

  const refreshSettings = useCallback(async () => {
    if (!currentUser?._id) {
      throw new Error('User not authenticated');
    }

    // Ensure settings exist
    await ensureSettingsExistMutation({ userId: currentUser._id });
  }, [currentUser?._id, ensureSettingsExistMutation]);

  // Memoize the return object to prevent unnecessary re-renders
  return useMemo(
    () => ({
      settings,
      isLoading,
      error: null,
      updateSettings,
      updateNotifications,
      updateQuestPrefs,
      updatePrivacy,
      updateAppPrefs,
      resetToDefaults,
      refreshSettings,
    }),
    [
      settings,
      isLoading,
      updateSettings,
      updateNotifications,
      updateQuestPrefs,
      updatePrivacy,
      updateAppPrefs,
      resetToDefaults,
      refreshSettings,
    ],
  );
}

import { useMutation, useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { Id } from '../convex/_generated/dataModel';

export interface UserSettings {
  _id: Id<'userSettings'>;
  userId: Id<'users'>;
  settings: any; // JSON object for flexible settings
  createdAt: number;
  updatedAt: number;
}

// Hook for getting user settings
export function useUserSettings(userId: Id<'users'> | undefined) {
  return useQuery(
    api.userSettings.getUserSettings,
    userId ? { userId } : 'skip',
  );
}

// Hook for creating user settings
export function useCreateUserSettings() {
  return useMutation(api.userSettings.createUserSettings);
}

// Hook for updating user settings
export function useUpdateUserSettings() {
  return useMutation(api.userSettings.updateUserSettings);
}

// Hook for deleting user settings
export function useDeleteUserSettings() {
  return useMutation(api.userSettings.deleteUserSettings);
}

// Utility function to get a specific setting value
export function getSettingValue(
  settings: any,
  key: string,
  defaultValue: any = null,
) {
  if (!settings || typeof settings !== 'object') {
    return defaultValue;
  }
  return settings[key] !== undefined ? settings[key] : defaultValue;
}

// Utility function to set a specific setting value
export function setSettingValue(settings: any, key: string, value: any) {
  return {
    ...settings,
    [key]: value,
  };
}

// Default settings structure
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
  preferences: {
    questDifficulty: 'moderate',
    dailyQuestLimit: 5,
    autoGenerateQuests: false,
  },
  theme: {
    mode: 'system', // 'light', 'dark', 'system'
  },
};

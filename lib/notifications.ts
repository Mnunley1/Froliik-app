import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const NOTIFICATION_SETTINGS_KEY = '@froliik_notification_settings';
const LAST_QUEST_NOTIFICATION_KEY = '@froliik_last_quest_notification';

export interface NotificationSettings {
  enabled: boolean;
  questReminders: boolean;
  dailyQuests: boolean;
  achievements: boolean;
  frequency: 'daily' | 'every2days' | 'weekly';
  preferredTime: string; // HH:MM format
}

const defaultSettings: NotificationSettings = {
  enabled: true,
  questReminders: true,
  dailyQuests: true,
  achievements: true,
  frequency: 'daily',
  preferredTime: '09:00',
};

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') {
    // For web, we'll use browser notifications
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === 'granted';
}

export async function getNotificationSettings(): Promise<NotificationSettings> {
  try {
    const settingsJson = await AsyncStorage.getItem(NOTIFICATION_SETTINGS_KEY);
    if (settingsJson) {
      return { ...defaultSettings, ...JSON.parse(settingsJson) };
    }
    return defaultSettings;
  } catch (error) {
    console.error('Error loading notification settings:', error);
    return defaultSettings;
  }
}

export async function saveNotificationSettings(
  settings: NotificationSettings,
): Promise<void> {
  try {
    await AsyncStorage.setItem(
      NOTIFICATION_SETTINGS_KEY,
      JSON.stringify(settings),
    );
  } catch (error) {
    console.error('Error saving notification settings:', error);
  }
}

export async function scheduleQuestNotification(
  title: string,
  body: string,
  triggerDate?: Date,
): Promise<string | null> {
  try {
    const settings = await getNotificationSettings();

    if (!settings.enabled || !settings.dailyQuests) {
      return null;
    }

    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      console.log('Notification permission not granted');
      return null;
    }

    if (Platform.OS === 'web') {
      // For web, show immediate notification or schedule with setTimeout
      if (triggerDate && triggerDate > new Date()) {
        const delay = triggerDate.getTime() - Date.now();
        setTimeout(() => {
          showWebNotification(title, body);
        }, delay);
        return 'web-scheduled';
      } else {
        showWebNotification(title, body);
        return 'web-immediate';
      }
    }

    // For mobile platforms
    const trigger = triggerDate ? { date: triggerDate } : null;

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger,
    });

    return notificationId;
  } catch (error) {
    console.error('Error scheduling notification:', error);
    return null;
  }
}

function showWebNotification(title: string, body: string): void {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon: '/icon.png',
      badge: '/icon.png',
    });
  }
}

export async function scheduleDailyQuestNotifications(): Promise<void> {
  try {
    const settings = await getNotificationSettings();

    if (!settings.enabled || !settings.dailyQuests) {
      return;
    }

    // Cancel existing scheduled notifications
    if (Platform.OS !== 'web') {
      await Notifications.cancelAllScheduledNotificationsAsync();
    }

    const [hours, minutes] = settings.preferredTime.split(':').map(Number);

    // Schedule notifications for the next 7 days
    for (let i = 1; i <= 7; i++) {
      const notificationDate = new Date();
      notificationDate.setDate(notificationDate.getDate() + i);
      notificationDate.setHours(hours, minutes, 0, 0);

      // Skip if the frequency doesn't match
      if (settings.frequency === 'every2days' && i % 2 !== 0) continue;
      if (settings.frequency === 'weekly' && i !== 7) continue;

      await scheduleQuestNotification(
        '🌟 New Quest Available!',
        "A new side quest is waiting for you. Ready for today's adventure?",
        notificationDate,
      );
    }
  } catch (error) {
    console.error('Error scheduling daily quest notifications:', error);
  }
}

export async function sendQuestCompletionNotification(
  questTitle: string,
): Promise<void> {
  try {
    const settings = await getNotificationSettings();

    if (!settings.enabled || !settings.achievements) {
      return;
    }

    await scheduleQuestNotification(
      '🎉 Quest Completed!',
      `Great job completing "${questTitle}"! Your growth journey continues.`,
    );
  } catch (error) {
    console.error('Error sending quest completion notification:', error);
  }
}

export async function sendQuestReminderNotification(
  questTitle: string,
): Promise<void> {
  try {
    const settings = await getNotificationSettings();

    if (!settings.enabled || !settings.questReminders) {
      return;
    }

    await scheduleQuestNotification(
      '⏰ Quest Reminder',
      `Don't forget about "${questTitle}". Small steps lead to big changes!`,
    );
  } catch (error) {
    console.error('Error sending quest reminder notification:', error);
  }
}

export async function shouldGenerateNewQuest(): Promise<boolean> {
  try {
    const settings = await getNotificationSettings();

    if (!settings.enabled || !settings.dailyQuests) {
      return false;
    }

    const lastNotificationStr = await AsyncStorage.getItem(
      LAST_QUEST_NOTIFICATION_KEY,
    );

    if (!lastNotificationStr) {
      return true; // First time
    }

    const lastNotification = new Date(lastNotificationStr);
    const now = new Date();
    const hoursSinceLastNotification =
      (now.getTime() - lastNotification.getTime()) / (1000 * 60 * 60);

    switch (settings.frequency) {
      case 'daily':
        return hoursSinceLastNotification >= 24;
      case 'every2days':
        return hoursSinceLastNotification >= 48;
      case 'weekly':
        return hoursSinceLastNotification >= 168; // 7 days
      default:
        return hoursSinceLastNotification >= 24;
    }
  } catch (error) {
    console.error('Error checking if should generate new quest:', error);
    return false;
  }
}

export async function markQuestNotificationSent(): Promise<void> {
  try {
    await AsyncStorage.setItem(
      LAST_QUEST_NOTIFICATION_KEY,
      new Date().toISOString(),
    );
  } catch (error) {
    console.error('Error marking quest notification as sent:', error);
  }
}

export async function cancelAllNotifications(): Promise<void> {
  try {
    if (Platform.OS !== 'web') {
      await Notifications.cancelAllScheduledNotificationsAsync();
    }
  } catch (error) {
    console.error('Error canceling notifications:', error);
  }
}

// In-app notification system for immediate feedback
export interface InAppNotification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  duration?: number;
  action?: {
    label: string;
    onPress: () => void;
  };
}

let notificationListeners: ((notification: InAppNotification) => void)[] = [];

export function subscribeToInAppNotifications(
  listener: (notification: InAppNotification) => void,
): () => void {
  notificationListeners.push(listener);

  return () => {
    notificationListeners = notificationListeners.filter((l) => l !== listener);
  };
}

export function showInAppNotification(
  notification: Omit<InAppNotification, 'id'>,
): void {
  const fullNotification: InAppNotification = {
    ...notification,
    id: Date.now().toString(),
    duration: notification.duration || 4000,
  };

  notificationListeners.forEach((listener) => listener(fullNotification));
}

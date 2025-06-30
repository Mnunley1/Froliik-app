import { Card } from '@/components/ui/Card';
import { AppText } from '@/components/ui/Typography';
import { Spacing } from '@/constants/colors';
import { useThemeColors } from '@/hooks/useColorScheme';
import { useUserSettings } from '@/hooks/useUserSettings';
import { Bell } from 'lucide-react-native';
import React, { memo, useMemo, useRef, useState } from 'react';
import { StyleSheet, Switch, View } from 'react-native';

// Memoized Switch component to prevent re-renders
const MemoizedSwitch = memo(
  ({
    value,
    onValueChange,
    disabled,
    style,
  }: {
    value: boolean;
    onValueChange: () => void;
    disabled?: boolean;
    style?: any;
  }) => (
    <Switch
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      style={style}
    />
  ),
);

export const NotificationSettings = memo(function NotificationSettings({
  onSettingUpdate,
}: {
  onSettingUpdate?: (settingName: string) => void;
} = {}) {
  const colors = useThemeColors();
  const { settings, updateNotifications } = useUserSettings();
  const [isUpdating, setIsUpdating] = useState(false);

  // Optimistic state for immediate UI updates
  const [optimisticSettings, setOptimisticSettings] = useState(
    settings.notifications,
  );
  const isInitialized = useRef(false);

  // Only update optimistic settings from server on initial load
  React.useEffect(() => {
    if (!isInitialized.current) {
      setOptimisticSettings(settings.notifications);
      isInitialized.current = true;
    }
  }, [settings.notifications]);

  const handleToggle = async (key: keyof typeof settings.notifications) => {
    // Immediately update the optimistic state for instant UI feedback
    const newValue = !optimisticSettings[key];
    setOptimisticSettings((prev) => ({
      ...prev,
      [key]: newValue,
    }));

    setIsUpdating(true);
    try {
      await updateNotifications({
        [key]: newValue,
      });
      onSettingUpdate?.(
        key === 'enabled'
          ? 'Notifications'
          : key === 'questReminders'
            ? 'Quest reminders'
            : key === 'communityUpdates'
              ? 'Community updates'
              : 'Achievements',
      );
    } catch (error) {
      console.error('Error updating notification settings:', error);
      // Revert optimistic update on error
      setOptimisticSettings((prev) => ({
        ...prev,
        [key]: !newValue,
      }));
    } finally {
      setIsUpdating(false);
    }
  };

  // Memoize the switch components
  const enabledSwitch = useMemo(
    () => (
      <MemoizedSwitch
        value={optimisticSettings.enabled}
        onValueChange={() => handleToggle('enabled')}
        style={styles.switch}
      />
    ),
    [optimisticSettings.enabled],
  );

  const questRemindersSwitch = useMemo(
    () => (
      <MemoizedSwitch
        value={optimisticSettings.questReminders}
        onValueChange={() => handleToggle('questReminders')}
        disabled={!optimisticSettings.enabled}
        style={styles.switch}
      />
    ),
    [optimisticSettings.questReminders, optimisticSettings.enabled],
  );

  const communityUpdatesSwitch = useMemo(
    () => (
      <MemoizedSwitch
        value={optimisticSettings.communityUpdates}
        onValueChange={() => handleToggle('communityUpdates')}
        disabled={!optimisticSettings.enabled}
        style={styles.switch}
      />
    ),
    [optimisticSettings.communityUpdates, optimisticSettings.enabled],
  );

  const achievementsSwitch = useMemo(
    () => (
      <MemoizedSwitch
        value={optimisticSettings.achievements}
        onValueChange={() => handleToggle('achievements')}
        disabled={!optimisticSettings.enabled}
        style={styles.switch}
      />
    ),
    [optimisticSettings.achievements, optimisticSettings.enabled],
  );

  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Bell size={20} color={colors.primary} strokeWidth={2} />
        </View>
        <View style={styles.titleContainer}>
          <AppText variant="h3">Notifications</AppText>
          <AppText variant="body" color="secondary">
            Manage your notification preferences
          </AppText>
        </View>
      </View>

      <View style={styles.settingsList}>
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <AppText variant="body" style={styles.settingTitle}>
              Enable Notifications
            </AppText>
            <AppText variant="caption" color="muted">
              Receive notifications from Froliik
            </AppText>
          </View>
          {enabledSwitch}
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <AppText variant="body" style={styles.settingTitle}>
              Quest Reminders
            </AppText>
            <AppText variant="caption" color="muted">
              Get reminded about your active quests
            </AppText>
          </View>
          {questRemindersSwitch}
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <AppText variant="body" style={styles.settingTitle}>
              Community Updates
            </AppText>
            <AppText variant="caption" color="muted">
              Stay updated on community activities
            </AppText>
          </View>
          {communityUpdatesSwitch}
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <AppText variant="body" style={styles.settingTitle}>
              Achievements
            </AppText>
            <AppText variant="caption" color="muted">
              Celebrate your accomplishments
            </AppText>
          </View>
          {achievementsSwitch}
        </View>
      </View>
    </Card>
  );
});

const styles = StyleSheet.create({
  container: {
    padding: Spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  titleContainer: {
    flex: 1,
  },
  settingsList: {
    gap: Spacing.lg,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  settingInfo: {
    flex: 1,
    marginRight: Spacing.md,
  },
  settingTitle: {
    marginBottom: Spacing.xs,
  },
  switch: {
    // Ensure consistent switch appearance and prevent jumping
    transform: [{ scaleX: 1 }, { scaleY: 1 }],
  },
});

import { Card } from '@/components/ui/Card';
import { AppText } from '@/components/ui/Typography';
import { Spacing } from '@/constants/colors';
import { useThemeColors } from '@/hooks/useColorScheme';
import { useUserSettings } from '@/hooks/useUserSettings';
import { Shield } from 'lucide-react-native';
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

export const PrivacySettings = memo(function PrivacySettings({
  onSettingUpdate,
}: {
  onSettingUpdate?: (settingName: string) => void;
} = {}) {
  const colors = useThemeColors();
  const { settings, updatePrivacy } = useUserSettings();
  const [isUpdating, setIsUpdating] = useState(false);

  // Optimistic state for immediate UI updates
  const [optimisticSettings, setOptimisticSettings] = useState(
    settings.privacy,
  );
  const isInitialized = useRef(false);

  // Only update optimistic settings from server on initial load
  React.useEffect(() => {
    if (!isInitialized.current) {
      setOptimisticSettings(settings.privacy);
      isInitialized.current = true;
    }
  }, [settings.privacy]);

  const handleToggle = async (key: keyof typeof settings.privacy) => {
    // Immediately update the optimistic state for instant UI feedback
    const newValue = !optimisticSettings[key];
    setOptimisticSettings((prev) => ({
      ...prev,
      [key]: newValue,
    }));

    setIsUpdating(true);
    try {
      await updatePrivacy({
        [key]: newValue,
      });
      onSettingUpdate?.(
        key === 'shareCompletedQuests'
          ? 'Share completed quests'
          : 'Show profile in community',
      );
    } catch (error) {
      console.error('Error updating privacy settings:', error);
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
  const shareCompletedQuestsSwitch = useMemo(
    () => (
      <MemoizedSwitch
        value={optimisticSettings.shareCompletedQuests}
        onValueChange={() => handleToggle('shareCompletedQuests')}
        style={styles.switch}
      />
    ),
    [optimisticSettings.shareCompletedQuests],
  );

  const showProfileSwitch = useMemo(
    () => (
      <MemoizedSwitch
        value={optimisticSettings.showProfileInCommunity}
        onValueChange={() => handleToggle('showProfileInCommunity')}
        style={styles.switch}
      />
    ),
    [optimisticSettings.showProfileInCommunity],
  );

  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Shield size={20} color={colors.primary} strokeWidth={2} />
        </View>
        <View style={styles.titleContainer}>
          <AppText variant="h3">Privacy</AppText>
          <AppText variant="body" color="secondary">
            Control your data and sharing preferences
          </AppText>
        </View>
      </View>

      <View style={styles.settingsList}>
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <AppText variant="body" style={styles.settingTitle}>
              Share Completed Quests
            </AppText>
            <AppText variant="caption" color="muted">
              Allow others to see your completed quests
            </AppText>
          </View>
          {shareCompletedQuestsSwitch}
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <AppText variant="body" style={styles.settingTitle}>
              Show Profile in Community
            </AppText>
            <AppText variant="caption" color="muted">
              Make your profile visible to other users
            </AppText>
          </View>
          {showProfileSwitch}
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

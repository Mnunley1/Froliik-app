import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { AppText } from '@/components/ui/Typography';
import { BorderRadius, Spacing } from '@/constants/colors';
import { useColorScheme, useThemeColors } from '@/hooks/useColorScheme';
import { Monitor, Moon, Sun } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, View } from 'react-native';

export function ThemeToggle() {
  const colors = useThemeColors();
  const { themeMode, setTheme, isLoading } = useColorScheme();

  const themeOptions = [
    { id: 'light', title: 'Light', icon: Sun },
    { id: 'dark', title: 'Dark', icon: Moon },
    { id: 'system', title: 'System', icon: Monitor },
  ] as const;

  const handleThemeChange = async (
    themeId: (typeof themeOptions)[number]['id']
  ) => {
    await setTheme(themeId);
  };

  if (isLoading) {
    return (
      <Card style={styles.container}>
        <View style={styles.header}>
          <AppText variant="h3">Theme</AppText>
          <AppText variant="caption" color="muted">
            Choose your preferred appearance
          </AppText>
        </View>
        <View style={styles.loadingContainer}>
          <AppText variant="body" color="muted">
            Loading theme settings...
          </AppText>
        </View>
      </Card>
    );
  }

  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <AppText variant="h3">Theme</AppText>
        <AppText variant="caption" color="muted">
          Choose your preferred appearance
        </AppText>
      </View>

      <View style={styles.options}>
        {themeOptions.map((option) => {
          const IconComponent = option.icon;
          const isSelected = themeMode === option.id;

          const buttonStyle = {
            ...styles.optionButton,
            borderColor: colors.border,
            ...(isSelected && {
              backgroundColor: colors.primary + '20',
              borderColor: colors.primary,
            }),
          };

          const iconStyle = {
            ...styles.optionIcon,
            backgroundColor: isSelected
              ? colors.primary + '20'
              : colors.muted + '20',
          };

          const textStyle = {
            ...styles.optionText,
            color: isSelected ? colors.primary : colors.text.muted,
          };

          return (
            <Button
              key={option.id}
              title=""
              onPress={() => handleThemeChange(option.id)}
              variant="ghost"
              disabled={isLoading}
              style={buttonStyle}
            >
              <View style={styles.optionContent}>
                <View style={iconStyle}>
                  <IconComponent
                    size={20}
                    color={isSelected ? colors.primary : colors.text.muted}
                    strokeWidth={2}
                  />
                </View>
                <AppText variant="caption" style={textStyle}>
                  {option.title}
                </AppText>
              </View>
            </Button>
          );
        })}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  header: {
    marginBottom: Spacing.lg,
  },
  loadingContainer: {
    padding: Spacing.lg,
    alignItems: 'center',
  },
  options: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  optionButton: {
    flex: 1,
    minHeight: 'auto',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    shadowOpacity: 0,
    elevation: 0,
    backgroundColor: 'transparent',
    borderWidth: 2,
  },
  optionContent: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: {
    fontSize: 12,
    textAlign: 'center',
  },
});

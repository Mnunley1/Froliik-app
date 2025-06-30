import { AppText } from '@/components/ui/Typography';
import { BorderRadius, Spacing } from '@/constants/colors';
import { useThemeColors } from '@/hooks/useColorScheme';
import { CircleAlert as AlertCircle } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface ErrorMessageProps {
  message: string;
  style?: any;
}

export function ErrorMessage({ message, style }: ErrorMessageProps) {
  const colors = useThemeColors();

  if (!message) return null;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.error + '10',
          borderColor: colors.error + '30',
        },
        style,
      ]}
    >
      <View style={styles.content}>
        <AlertCircle size={16} color={colors.error} strokeWidth={2} />
        <AppText
          variant="caption"
          style={{ ...styles.message, color: colors.error }}
        >
          {message}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginVertical: Spacing.sm,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  message: {
    flex: 1,
    lineHeight: 18,
  },
});

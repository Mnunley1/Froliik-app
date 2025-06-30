import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  View,
} from 'react-native';
import { useThemeColors } from '@/hooks/useColorScheme';
import { Typography, BorderRadius, Spacing } from '@/constants/colors';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  children?: React.ReactNode;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  style,
  children,
}: ButtonProps) {
  const colors = useThemeColors();

  const buttonStyles = [
    styles.base,
    styles[size],
    getVariantStyles(variant, colors),
    (disabled || loading) && styles.disabled,
    style,
  ];

  const textStyles = [
    styles.text,
    styles[`text${size.charAt(0).toUpperCase() + size.slice(1)}` as keyof typeof styles],
    getTextVariantStyles(variant, colors),
    (disabled || loading) && styles.textDisabled,
  ];

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' || variant === 'secondary' ? colors.text.inverse : colors.primary}
        />
      ) : children ? (
        <View style={styles.childrenContainer}>
          {children}
        </View>
      ) : (
        <Text style={textStyles}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

function getVariantStyles(variant: string, colors: any): ViewStyle {
  switch (variant) {
    case 'primary':
      return {
        backgroundColor: colors.primary,
        borderWidth: 0,
      };
    case 'secondary':
      return {
        backgroundColor: colors.secondary,
        borderWidth: 0,
      };
    case 'outline':
      return {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: colors.border,
      };
    case 'ghost':
      return {
        backgroundColor: 'transparent',
        borderWidth: 0,
      };
    default:
      return {};
  }
}

function getTextVariantStyles(variant: string, colors: any): TextStyle {
  switch (variant) {
    case 'primary':
    case 'secondary':
      return {
        color: colors.text.inverse,
      };
    case 'outline':
      return {
        color: colors.text.primary,
      };
    case 'ghost':
      return {
        color: colors.text.primary,
      };
    default:
      return {};
  }
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.full,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sm: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    minHeight: 36,
  },
  md: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    minHeight: 44,
  },
  lg: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    minHeight: 52,
  },
  text: {
    fontFamily: 'Inter-SemiBold',
    textAlign: 'center',
  },
  textSm: {
    fontSize: Typography.fontSize.sm,
  },
  textMd: {
    fontSize: Typography.fontSize.base,
  },
  textLg: {
    fontSize: Typography.fontSize.lg,
  },
  disabled: {
    opacity: 0.5,
    shadowOpacity: 0,
    elevation: 0,
  },
  textDisabled: {
    opacity: 0.7,
  },
  childrenContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
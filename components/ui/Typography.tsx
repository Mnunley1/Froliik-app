import React from 'react';
import { Text, StyleSheet, TextStyle } from 'react-native';
import { useThemeColors } from '@/hooks/useColorScheme';
import { Typography } from '@/constants/colors';

interface TypographyProps {
  children: React.ReactNode;
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'caption' | 'overline';
  color?: 'primary' | 'secondary' | 'muted' | 'inverse';
  align?: 'left' | 'center' | 'right';
  style?: TextStyle;
}

export function AppText({
  children,
  variant = 'body',
  color = 'primary',
  align = 'left',
  style,
}: TypographyProps) {
  const colors = useThemeColors();

  const textStyles = [
    styles.base,
    styles[variant],
    { color: colors.text[color] },
    { textAlign: align },
    style,
  ];

  return <Text style={textStyles}>{children}</Text>;
}

const styles = StyleSheet.create({
  base: {
    lineHeight: Typography.lineHeight.normal * Typography.fontSize.base,
  },
  h1: {
    fontFamily: 'DMSans-Bold',
    fontSize: Typography.fontSize.xxxl,
    fontWeight: Typography.fontWeight.bold,
    lineHeight: Typography.lineHeight.tight * Typography.fontSize.xxxl,
  },
  h2: {
    fontFamily: 'DMSans-Bold',
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.bold,
    lineHeight: Typography.lineHeight.tight * Typography.fontSize.xxl,
  },
  h3: {
    fontFamily: 'DMSans-Medium',
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.semibold,
    lineHeight: Typography.lineHeight.normal * Typography.fontSize.xl,
  },
  body: {
    fontFamily: 'Inter-Regular',
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.normal,
    lineHeight: Typography.lineHeight.relaxed * Typography.fontSize.base,
  },
  caption: {
    fontFamily: 'Inter-Medium',
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    lineHeight: Typography.lineHeight.normal * Typography.fontSize.sm,
  },
  overline: {
    fontFamily: 'Inter-SemiBold',
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    lineHeight: Typography.lineHeight.normal * Typography.fontSize.xs,
  },
});
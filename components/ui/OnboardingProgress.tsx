import { BorderRadius, Spacing } from '@/constants/colors';
import { useThemeColors } from '@/hooks/useColorScheme';
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
  style?: any;
}

export function OnboardingProgress({
  currentStep,
  totalSteps,
  style,
}: OnboardingProgressProps) {
  const colors = useThemeColors();

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
        <View
          style={[
            styles.progressFill,
            {
              backgroundColor: colors.primary,
              width: `${(currentStep / totalSteps) * 100}%`,
            },
          ]}
        />
      </View>
      <View style={styles.stepIndicators}>
        {Array.from({ length: totalSteps }, (_, index) => (
          <View
            key={index}
            style={[
              styles.stepDot,
              {
                backgroundColor:
                  index < currentStep ? colors.primary : colors.border,
                borderColor:
                  index === currentStep - 1 ? colors.primary : colors.border,
                borderWidth: index === currentStep - 1 ? 3 : 2,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  progressBar: {
    width: '100%',
    height: 6,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
  stepIndicators: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});

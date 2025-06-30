import { useThemeColors } from '@/hooks/useColorScheme';
import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, View } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface ConfettiPiece {
  id: number;
  translateX: Animated.Value;
  translateY: Animated.Value;
  rotation: Animated.Value;
  scale: Animated.Value;
  opacity: Animated.Value;
  color: string;
  size: number;
  startX: number;
}

interface ConfettiAnimationProps {
  visible: boolean;
  onAnimationComplete?: () => void;
}

export function ConfettiAnimation({
  visible,
  onAnimationComplete,
}: ConfettiAnimationProps) {
  const colors = useThemeColors();
  const confettiPieces = useRef<ConfettiPiece[]>([]);
  const animationRef = useRef<Animated.Value>(new Animated.Value(0));

  const confettiColors = [
    colors.primary,
    colors.accent,
    colors.secondary,
    colors.success,
    colors.warning,
    '#8b5cf6', // purple
    '#06b6d4', // cyan
    '#ec4899', // pink
    '#fbbf24', // amber
    '#10b981', // emerald
  ];

  useEffect(() => {
    if (visible) {
      startConfettiAnimation();
    }
  }, [visible]);

  const startConfettiAnimation = () => {
    // Create confetti pieces
    confettiPieces.current = Array.from({ length: 50 }, (_, index) => {
      const startX = Math.random() * screenWidth;
      return {
        id: index,
        translateX: new Animated.Value(startX),
        translateY: new Animated.Value(-20),
        rotation: new Animated.Value(0),
        scale: new Animated.Value(0),
        opacity: new Animated.Value(1),
        color:
          confettiColors[Math.floor(Math.random() * confettiColors.length)],
        size: Math.random() * 8 + 4,
        startX, // Store the initial X position
      };
    });

    // Animate each piece
    const animations = confettiPieces.current.map((piece, index) => {
      const delay = index * 20; // Stagger the animations
      const duration = 3000 + Math.random() * 2000; // Random duration between 3-5s
      const finalY = screenHeight + 100;
      const finalX = piece.startX + (Math.random() - 0.5) * 200; // Random horizontal movement

      return Animated.parallel([
        // Fall down
        Animated.timing(piece.translateY, {
          toValue: finalY,
          duration,
          delay,
          useNativeDriver: true,
        }),
        // Move horizontally
        Animated.timing(piece.translateX, {
          toValue: finalX,
          duration,
          delay,
          useNativeDriver: true,
        }),
        // Rotate
        Animated.timing(piece.rotation, {
          toValue: Math.random() * 360,
          duration,
          delay,
          useNativeDriver: true,
        }),
        // Scale in and out
        Animated.sequence([
          Animated.timing(piece.scale, {
            toValue: 1,
            duration: 200,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(piece.scale, {
            toValue: 0.8,
            duration: duration - 200,
            delay: delay + 200,
            useNativeDriver: true,
          }),
        ]),
        // Fade out
        Animated.timing(piece.opacity, {
          toValue: 0,
          duration: 1000,
          delay: delay + duration - 1000,
          useNativeDriver: true,
        }),
      ]);
    });

    // Run all animations
    Animated.parallel(animations).start(() => {
      if (onAnimationComplete) {
        onAnimationComplete();
      }
    });
  };

  if (!visible) {
    return null;
  }

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {confettiPieces.current.map((piece) => (
        <Animated.View
          key={piece.id}
          style={[
            styles.confettiPiece,
            {
              backgroundColor: piece.color,
              width: piece.size,
              height: piece.size,
              transform: [
                { translateX: piece.translateX },
                { translateY: piece.translateY },
                {
                  rotate: piece.rotation.interpolate({
                    inputRange: [0, 360],
                    outputRange: ['0deg', '360deg'],
                  }),
                },
                { scale: piece.scale },
              ],
              opacity: piece.opacity,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  confettiPiece: {
    position: 'absolute',
    borderRadius: 2,
  },
});

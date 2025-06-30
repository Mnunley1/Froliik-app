import { Button } from '@/components/ui/Button';
import { AppText } from '@/components/ui/Typography';
import { BorderRadius, Spacing } from '@/constants/colors';
import { useThemeColors } from '@/hooks/useColorScheme';
import {
  AlertTriangle,
  CheckCircle,
  Info,
  X,
  XCircle,
} from 'lucide-react-native';
import React from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

export interface AlertProps {
  visible: boolean;
  title: string;
  message?: string;
  type?: 'success' | 'info' | 'warning' | 'error';
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  onDismiss?: () => void;
  showCancel?: boolean;
  destructive?: boolean;
}

export function Alert({
  visible,
  title,
  message,
  type = 'info',
  confirmText = 'OK',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  onDismiss,
  showCancel = false,
  destructive = false,
}: AlertProps) {
  const colors = useThemeColors();
  const [fadeAnim] = React.useState(new Animated.Value(0));
  const [scaleAnim] = React.useState(new Animated.Value(0.8));

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const getAlertColors = () => {
    switch (type) {
      case 'success':
        return {
          icon: colors.success,
          background: colors.success + '10',
          border: colors.success + '30',
        };
      case 'warning':
        return {
          icon: colors.warning,
          background: colors.warning + '10',
          border: colors.warning + '30',
        };
      case 'error':
        return {
          icon: colors.error,
          background: colors.error + '10',
          border: colors.error + '30',
        };
      case 'info':
      default:
        return {
          icon: colors.primary,
          background: colors.primary + '10',
          border: colors.primary + '30',
        };
    }
  };

  const getAlertIcon = () => {
    const iconColor = getAlertColors().icon;
    const size = 24;

    switch (type) {
      case 'success':
        return <CheckCircle size={size} color={iconColor} strokeWidth={2} />;
      case 'warning':
        return <AlertTriangle size={size} color={iconColor} strokeWidth={2} />;
      case 'error':
        return <XCircle size={size} color={iconColor} strokeWidth={2} />;
      case 'info':
      default:
        return <Info size={size} color={iconColor} strokeWidth={2} />;
    }
  };

  const handleConfirm = () => {
    onConfirm?.();
    onDismiss?.();
  };

  const handleCancel = () => {
    onCancel?.();
    onDismiss?.();
  };

  const alertColors = getAlertColors();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onDismiss}
    >
      <Animated.View
        style={[
          styles.overlay,
          {
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            opacity: fadeAnim,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.overlayTouchable}
          activeOpacity={1}
          onPress={onDismiss}
        >
          <Animated.View
            style={[
              styles.alertContainer,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <TouchableOpacity
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <View style={styles.header}>
                <View
                  style={[
                    styles.iconContainer,
                    {
                      backgroundColor: alertColors.background,
                      borderColor: alertColors.border,
                    },
                  ]}
                >
                  {getAlertIcon()}
                </View>
                <TouchableOpacity
                  onPress={onDismiss}
                  style={styles.closeButton}
                >
                  <X size={20} color={colors.text.muted} strokeWidth={2} />
                </TouchableOpacity>
              </View>

              {/* Content */}
              <View style={styles.content}>
                <AppText variant="h3" style={styles.title}>
                  {title}
                </AppText>
                {message && (
                  <AppText
                    variant="body"
                    color="secondary"
                    style={styles.message}
                  >
                    {message}
                  </AppText>
                )}
              </View>

              {/* Actions */}
              <View style={styles.actions}>
                {showCancel && (
                  <Button
                    title={cancelText}
                    onPress={handleCancel}
                    variant="outline"
                    style={styles.actionButton}
                  />
                )}
                <Button
                  title={confirmText}
                  onPress={handleConfirm}
                  variant={destructive ? 'secondary' : 'primary'}
                  style={
                    [
                      styles.actionButton,
                      showCancel && styles.actionButtonWithCancel,
                    ] as any
                  }
                />
              </View>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayTouchable: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  alertContainer: {
    width: '100%',
    maxWidth: 400,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  closeButton: {
    padding: Spacing.xs,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  title: {
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
    lineHeight: 22,
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
  actionButtonWithCancel: {
    flex: 1,
  },
});

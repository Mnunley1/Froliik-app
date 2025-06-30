import { useThemeColors } from '@/hooks/useColorScheme';
import { subscribeToInAppNotifications } from '@/lib/notifications';
import React, { useEffect } from 'react';
import { Toaster, toast } from 'sonner-native';

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const colors = useThemeColors();

  useEffect(() => {
    const unsubscribe = subscribeToInAppNotifications((notification) => {
      const toastOptions: any = {
        duration: notification.duration || 4000,
      };

      if (notification.action) {
        toastOptions.action = {
          label: notification.action.label,
          onClick: notification.action.onPress,
        };
      }

      switch (notification.type) {
        case 'success':
          toast.success(notification.title, {
            description: notification.message,
            ...toastOptions,
          });
          break;
        case 'error':
          toast.error(notification.title, {
            description: notification.message,
            ...toastOptions,
          });
          break;
        case 'warning':
          toast.warning(notification.title, {
            description: notification.message,
            ...toastOptions,
          });
          break;
        case 'info':
        default:
          toast.info(notification.title, {
            description: notification.message,
            ...toastOptions,
          });
          break;
      }
    });

    return unsubscribe;
  }, []);

  return (
    <>
      {children}
      <Toaster
        position="top-center"
        offset={60}
        theme={colors.background === '#0f0f23' ? 'dark' : 'light'}
        richColors
        closeButton
        duration={4000}
        style={{
          backgroundColor: colors.background,
          borderColor: colors.border,
        }}
      />
    </>
  );
}

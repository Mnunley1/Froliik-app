import { useCallback, useState } from 'react';

export interface AlertOptions {
  title: string;
  message?: string;
  type?: 'success' | 'info' | 'warning' | 'error';
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
  destructive?: boolean;
}

export interface AlertState extends AlertOptions {
  visible: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export function useAlert() {
  const [alertState, setAlertState] = useState<AlertState>({
    visible: false,
    title: '',
  });

  const showAlert = useCallback((options: AlertOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setAlertState({
        ...options,
        visible: true,
        onConfirm: () => {
          setAlertState((prev) => ({ ...prev, visible: false }));
          resolve(true);
        },
        onCancel: () => {
          setAlertState((prev) => ({ ...prev, visible: false }));
          resolve(false);
        },
      });
    });
  }, []);

  const hideAlert = useCallback(() => {
    setAlertState((prev) => ({ ...prev, visible: false }));
  }, []);

  // Convenience methods
  const showSuccess = useCallback(
    (title: string, message?: string) => {
      return showAlert({ title, message, type: 'success' });
    },
    [showAlert]
  );

  const showError = useCallback(
    (title: string, message?: string) => {
      return showAlert({ title, message, type: 'error' });
    },
    [showAlert]
  );

  const showWarning = useCallback(
    (title: string, message?: string) => {
      return showAlert({ title, message, type: 'warning' });
    },
    [showAlert]
  );

  const showInfo = useCallback(
    (title: string, message?: string) => {
      return showAlert({ title, message, type: 'info' });
    },
    [showAlert]
  );

  const showConfirm = useCallback(
    (
      title: string,
      message?: string,
      confirmText = 'Confirm',
      cancelText = 'Cancel',
      destructive = false
    ) => {
      return showAlert({
        title,
        message,
        type: 'warning',
        confirmText,
        cancelText,
        showCancel: true,
        destructive,
      });
    },
    [showAlert]
  );

  return {
    alertState,
    showAlert,
    hideAlert,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showConfirm,
  };
}

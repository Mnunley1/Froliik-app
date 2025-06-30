import { Alert } from '@/components/ui/Alert';
import React, { createContext, useCallback, useContext, useState } from 'react';

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

interface AlertContextType {
  alertState: AlertState;
  showAlert: (options: AlertOptions) => Promise<boolean>;
  hideAlert: () => void;
  showSuccess: (title: string, message?: string) => Promise<boolean>;
  showError: (title: string, message?: string) => Promise<boolean>;
  showWarning: (title: string, message?: string) => Promise<boolean>;
  showInfo: (title: string, message?: string) => Promise<boolean>;
  showConfirm: (
    title: string,
    message?: string,
    confirmText?: string,
    cancelText?: string,
    destructive?: boolean
  ) => Promise<boolean>;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function AlertProvider({ children }: { children: React.ReactNode }) {
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

  const value: AlertContextType = {
    alertState,
    showAlert,
    hideAlert,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showConfirm,
  };

  return (
    <AlertContext.Provider value={value}>
      {children}
      {/* Global Alert Component */}
      <Alert
        visible={alertState.visible}
        title={alertState.title}
        message={alertState.message}
        type={alertState.type}
        confirmText={alertState.confirmText}
        cancelText={alertState.cancelText}
        onConfirm={alertState.onConfirm}
        onCancel={alertState.onCancel}
        onDismiss={alertState.onCancel}
        showCancel={alertState.showCancel}
        destructive={alertState.destructive}
      />
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const context = useContext(AlertContext);
  if (context === undefined) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
}

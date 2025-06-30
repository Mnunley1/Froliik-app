import { Alert } from 'react-native';

// Fallback to native Alert if AlertProvider is not available
// This ensures backward compatibility while we migrate to the new system

export const showSuccessAlert = (title: string, message?: string) => {
  Alert.alert(title, message, [{ text: 'OK' }]);
};

export const showErrorAlert = (title: string, message?: string) => {
  Alert.alert(title, message, [{ text: 'OK' }]);
};

export const showConfirmAlert = (
  title: string,
  message: string,
  onConfirm: () => void,
  onCancel?: () => void
) => {
  Alert.alert(title, message, [
    { text: 'Cancel', style: 'cancel', onPress: onCancel },
    { text: 'Confirm', onPress: onConfirm },
  ]);
};

export const showDestructiveConfirmAlert = (
  title: string,
  message: string,
  onConfirm: () => void,
  onCancel?: () => void
) => {
  Alert.alert(title, message, [
    { text: 'Cancel', style: 'cancel', onPress: onCancel },
    { text: 'Delete', style: 'destructive', onPress: onConfirm },
  ]);
};

// Note: To use the new AlertProvider system, import useAlert from '@/components/ui/AlertProvider
// and use the methods like showSuccess, showError, showConfirm, etc.
// Example:
// const { showSuccess, showError, showConfirm } = useAlert();
// await showSuccess('Success', 'Operation completed');

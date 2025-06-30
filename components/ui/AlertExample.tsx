import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { AppText } from '@/components/ui/Typography';
import { Spacing } from '@/constants/colors';
import { useAlert } from '@/hooks/useAlert';
import React from 'react';
import { StyleSheet, View } from 'react-native';

export function AlertExample() {
  const {
    alertState,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showConfirm,
  } = useAlert();

  const handleShowSuccess = async () => {
    await showSuccess('Success!', 'Your action was completed successfully.');
    console.log('Success alert confirmed');
  };

  const handleShowError = async () => {
    await showError('Error', 'Something went wrong. Please try again.');
    console.log('Error alert confirmed');
  };

  const handleShowWarning = async () => {
    await showWarning('Warning', 'This action may have consequences.');
    console.log('Warning alert confirmed');
  };

  const handleShowInfo = async () => {
    await showInfo(
      'Information',
      'Here is some important information for you.'
    );
    console.log('Info alert confirmed');
  };

  const handleShowConfirm = async () => {
    const confirmed = await showConfirm(
      'Confirm Action',
      'Are you sure you want to proceed with this action?',
      'Proceed',
      'Cancel',
      true
    );

    if (confirmed) {
      console.log('User confirmed the action');
      await showSuccess('Confirmed!', 'Your action has been completed.');
    } else {
      console.log('User cancelled the action');
    }
  };

  return (
    <Card>
      <AppText variant="h3" style={styles.title}>
        Alert Examples
      </AppText>

      <View style={styles.buttonContainer}>
        <Button
          title="Show Success Alert"
          onPress={handleShowSuccess}
          variant="primary"
          style={styles.button}
        />

        <Button
          title="Show Error Alert"
          onPress={handleShowError}
          variant="secondary"
          style={styles.button}
        />

        <Button
          title="Show Warning Alert"
          onPress={handleShowWarning}
          variant="outline"
          style={styles.button}
        />

        <Button
          title="Show Info Alert"
          onPress={handleShowInfo}
          variant="ghost"
          style={styles.button}
        />

        <Button
          title="Show Confirmation"
          onPress={handleShowConfirm}
          variant="outline"
          style={styles.button}
        />
      </View>

      {/* Custom Alert Component */}
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
    </Card>
  );
}

const styles = StyleSheet.create({
  title: {
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  buttonContainer: {
    gap: Spacing.md,
  },
  button: {
    marginBottom: Spacing.sm,
  },
});

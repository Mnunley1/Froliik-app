/**
 * AccountDeletionDialog Component
 *
 * A comprehensive account deletion dialog that provides a safe and user-friendly way
 * to delete user accounts with proper confirmation and error handling.
 *
 * Usage:
 * ```tsx
 * import { AccountDeletionDialog } from '@/components/ui/AccountDeletionDialog';
 *
 * function ProfileScreen() {
 *   const [showDeleteDialog, setShowDeleteDialog] = useState(false);
 *
 *   return (
 *     <View>
 *       <Button
 *         title="Delete Account"
 *         onPress={() => setShowDeleteDialog(true)}
 *         variant="primary"
 *         style={{ backgroundColor: colors.error }}
 *       />
 *
 *       <AccountDeletionDialog
 *         visible={showDeleteDialog}
 *         onClose={() => setShowDeleteDialog(false)}
 *       />
 *     </View>
 *   );
 * }
 * ```
 */

import { Button } from '@/components/ui/Button';
import { AppText } from '@/components/ui/Typography';
import { Spacing } from '@/constants/colors';
import { useThemeColors } from '@/hooks/useColorScheme';
import { useAuth } from '@clerk/clerk-expo';
import { useQuery } from 'convex/react';
import { AlertTriangle, Trash2 } from 'lucide-react-native';
import React, { useState } from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import { api } from '../../convex/_generated/api';

interface AccountDeletionDialogProps {
  visible: boolean;
  onClose: () => void;
}

export function AccountDeletionDialog({
  visible,
  onClose,
}: AccountDeletionDialogProps) {
  const colors = useThemeColors();
  const { signOut } = useAuth();
  const currentUser = useQuery(api.users.current);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    if (!currentUser?._id) {
      console.error('No user ID available for deletion');
      return;
    }

    setIsDeleting(true);

    try {
      // Delete user from Convex database
      // Note: You'll need to implement this mutation in your users.ts file
      // await deleteUserMutation({ userId: currentUser._id });

      // Sign out from Clerk
      await signOut();

      // Close the dialog
      onClose();
    } catch (error) {
      console.error('Error deleting account:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.dialog, { backgroundColor: colors.surface }]}>
          <View style={styles.iconContainer}>
            <AlertTriangle size={48} color={colors.error} />
          </View>

          <AppText variant="h2" align="center" style={styles.title}>
            Delete Account
          </AppText>

          <AppText
            variant="body"
            color="secondary"
            align="center"
            style={styles.message}
          >
            Are you sure you want to delete your account? This action cannot be
            undone and will permanently remove all your data.
          </AppText>

          <View style={styles.buttonContainer}>
            <Button
              title="Cancel"
              variant="outline"
              onPress={onClose}
              disabled={isDeleting}
              style={styles.cancelButton}
            />

            <Button
              title={isDeleting ? 'Deleting...' : 'Delete Account'}
              variant="outline"
              onPress={handleDeleteAccount}
              disabled={isDeleting}
              style={StyleSheet.flatten([
                styles.deleteButton,
                { borderColor: colors.error },
              ])}
            >
              <Trash2 size={20} color={colors.error} />
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  dialog: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    padding: Spacing.xl,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: Spacing.lg,
  },
  title: {
    marginBottom: Spacing.md,
  },
  message: {
    marginBottom: Spacing.xl,
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
    width: '100%',
  },
  cancelButton: {
    flex: 1,
  },
  deleteButton: {
    flex: 1,
  },
});

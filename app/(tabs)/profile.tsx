import { AccountDeletionDialog } from '@/components/ui/AccountDeletionDialog';
import { useAlert } from '@/components/ui/AlertProvider';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { NotificationSettings } from '@/components/ui/NotificationSettings';
import { PrivacySettings } from '@/components/ui/PrivacySettings';
import { QuestPreferences } from '@/components/ui/QuestPreferences';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { AppText } from '@/components/ui/Typography';
import { Spacing } from '@/constants/colors';
import { useThemeColors } from '@/hooks/useColorScheme';
import { useUserSettings } from '@/hooks/useUserSettings';
import { showInAppNotification } from '@/lib/notifications';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { useMutation } from 'convex/react';
import { useRouter } from 'expo-router';
import {
  HelpCircle,
  LogOut,
  Settings,
  Trash2,
  User,
} from 'lucide-react-native';
import React, { memo, useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '../../convex/_generated/api';

// Memoized header component to prevent re-renders
const ProfileHeader = memo(
  ({ currentUser, colors }: { currentUser: any; colors: any }) => (
    <View style={styles.header}>
      <View
        style={[
          styles.avatarContainer,
          { backgroundColor: colors.primary + '20' },
        ]}
      >
        <User size={32} color={colors.primary} strokeWidth={2} />
      </View>
      <AppText variant="h2" style={styles.name}>
        {currentUser?.fullName || 'Explorer'}
      </AppText>
      <AppText variant="body" color="secondary">
        {currentUser?.email}
      </AppText>
      <AppText variant="caption" color="muted">
        Gentle Explorer • Member since{' '}
        {new Date(currentUser?.createdAt || '').toLocaleDateString('en-US', {
          month: 'short',
          year: 'numeric',
        })}
      </AppText>
    </View>
  ),
);

// Memoized section header component
const SectionHeader = memo(
  ({
    icon: Icon,
    title,
    colors,
  }: {
    icon: any;
    title: string;
    colors: any;
  }) => (
    <View style={styles.sectionHeader}>
      <Icon size={20} color={colors.text.secondary} strokeWidth={2} />
      <AppText variant="h3" color="secondary">
        {title}
      </AppText>
    </View>
  ),
);

// Memoized help card component
const HelpCard = memo(
  ({ colors, onPress }: { colors: any; onPress: () => void }) => (
    <Card style={styles.helpCard}>
      <Button
        title=""
        onPress={onPress}
        variant="ghost"
        style={styles.helpButton}
      >
        <View style={styles.helpContent}>
          <View style={styles.helpLeft}>
            <View
              style={[
                styles.helpIcon,
                { backgroundColor: colors.secondary + '20' },
              ]}
            >
              <HelpCircle size={20} color={colors.secondary} strokeWidth={2} />
            </View>
            <View>
              <AppText variant="h3">Help & Support</AppText>
              <AppText variant="caption" color="muted">
                Get help, report issues, or contact us
              </AppText>
            </View>
          </View>
        </View>
      </Button>
    </Card>
  ),
);

// Memoized action card component
const ActionCard = memo(
  ({
    icon: Icon,
    title,
    description,
    color,
    onPress,
    loading,
    colors,
  }: {
    icon: any;
    title: string;
    description: string;
    color: string;
    onPress: () => void;
    loading: boolean;
    colors: any;
  }) => (
    <Card style={[styles.actionCard, { borderColor: color + '30' }] as any}>
      <View style={styles.actionHeader}>
        <View
          style={[
            styles.actionIconContainer,
            { backgroundColor: color + '10' },
          ]}
        >
          <Icon size={20} color={color} strokeWidth={2} />
        </View>
        <View style={styles.actionTextContainer}>
          <AppText variant="h3" style={[styles.actionTitle, { color }] as any}>
            {title}
          </AppText>
          <AppText variant="caption" color="muted">
            {description}
          </AppText>
        </View>
      </View>

      <Button
        title=""
        onPress={onPress}
        variant="outline"
        loading={loading}
        disabled={loading}
        style={
          [
            styles.actionButton,
            {
              borderColor: color,
              backgroundColor: loading ? color + '10' : 'transparent',
            },
          ] as any
        }
      >
        {!loading && (
          <View style={styles.actionButtonContent}>
            <Icon size={18} color={color} strokeWidth={2} />
            <AppText
              variant="body"
              style={[styles.actionButtonText, { color }] as any}
            >
              {title}
            </AppText>
          </View>
        )}
      </Button>
    </Card>
  ),
);

// Main profile screen component
export default function ProfileScreen() {
  const colors = useThemeColors();
  const { user: currentUser, isSignedIn } = useUser();
  const { signOut, userId } = useAuth();
  const router = useRouter();
  const { showConfirm } = useAlert();
  const { settings } = useUserSettings();
  const deleteAccountMutation = useMutation(api.users.deleteAccount);

  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const showSuccessNotification = useCallback((settingName: string) => {
    showInAppNotification({
      title: 'Setting Updated',
      message: `${settingName} has been updated successfully.`,
      type: 'success',
      duration: 3000,
    });
  }, []);

  const handleHelpSupport = useCallback(() => {
    console.log('🔘 ProfileScreen: Help & Support button clicked');
    router.push('/help');
  }, [router]);

  const handleSignOut = useCallback(async () => {
    console.log('🚪 ProfileScreen: Sign out button pressed');

    if (isSigningOut) {
      console.log('⚠️ ProfileScreen: Sign out already in progress, ignoring');
      return;
    }

    console.log('❓ ProfileScreen: Showing sign out confirmation dialog');

    const confirmed = await showConfirm(
      'Sign Out',
      'Are you sure you want to sign out?',
      'Sign Out',
      'Cancel',
    );

    if (confirmed) {
      console.log('✅ ProfileScreen: User confirmed sign out');
      await performSignOut();
    } else {
      console.log('❌ ProfileScreen: Sign out cancelled by user');
    }
  }, [isSigningOut, showConfirm]);

  const performSignOut = useCallback(async () => {
    if (isSigningOut) {
      console.log(
        '⚠️ ProfileScreen: performSignOut called but already in progress',
      );
      return;
    }

    try {
      console.log('🚪 ProfileScreen: Starting performSignOut...');
      setIsSigningOut(true);

      console.log('📞 ProfileScreen: Calling signOut from Clerk...');
      await signOut();

      console.log('✅ ProfileScreen: Sign out completed successfully');

      // Show success notification banner
      showInAppNotification({
        title: 'Signed Out',
        message: 'You have been successfully signed out.',
        type: 'success',
        duration: 3000,
      });

      // Navigate immediately to login page
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('💥 ProfileScreen: Unexpected sign out error:', error);

      const retry = await showConfirm(
        'Sign Out Failed',
        'There was an unexpected error signing out. Please try again.',
        'Try Again',
        'Cancel',
      );

      if (retry) {
        await performSignOut();
      }
    } finally {
      console.log('🏁 ProfileScreen: performSignOut finally block');
      setIsSigningOut(false);
    }
  }, [isSigningOut, signOut, showConfirm, router]);

  const handleDeleteAccount = useCallback(() => {
    console.log('🗑️ ProfileScreen: Delete account button pressed');
    setShowDeleteDialog(true);
  }, []);

  const performDeleteAccount = useCallback(async () => {
    if (isDeletingAccount) {
      console.log(
        '⚠️ ProfileScreen: performDeleteAccount called but already in progress',
      );
      return;
    }

    try {
      console.log('🗑️ ProfileScreen: Starting performDeleteAccount...');
      setIsDeletingAccount(true);

      console.log('📞 ProfileScreen: Calling deleteAccount mutation...');
      await deleteAccountMutation();

      console.log('✅ ProfileScreen: Account deletion completed successfully');

      // Sign out the user from Clerk immediately after deleting their data
      console.log('🚪 ProfileScreen: Signing out user from Clerk...');
      await signOut();

      console.log('✅ ProfileScreen: User signed out from Clerk');

      // Show success notification banner
      showInAppNotification({
        title: 'Account Deleted',
        message:
          'Your account has been permanently deleted. Thank you for using Froliik.',
        type: 'success',
        duration: 4000,
      });

      // Navigate immediately to login page
      router.replace('/(auth)/login');
    } catch (error) {
      console.error(
        '💥 ProfileScreen: Unexpected account deletion error:',
        error,
      );

      // Show error notification
      showInAppNotification({
        title: 'Account Deletion Failed',
        message:
          'There was an unexpected error deleting your account. Please try again or contact support for assistance.',
        type: 'error',
        duration: 5000,
      });

      const retry = await showConfirm(
        'Account Deletion Failed',
        'There was an unexpected error deleting your account. Please try again or contact support for assistance.',
        'Try Again',
        'Cancel',
      );

      if (retry) {
        await performDeleteAccount();
      }
    } finally {
      console.log('🏁 ProfileScreen: performDeleteAccount finally block');
      setIsDeletingAccount(false);
    }
  }, [isDeletingAccount, deleteAccountMutation, signOut, showConfirm, router]);

  console.log('🔄 ProfileScreen: Rendering with state:', {
    isSigningOut,
    isDeletingAccount,
    hasUser: isSignedIn,
    userId: userId,
  });

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <ProfileHeader currentUser={currentUser} colors={colors} />

        {/* Settings Section */}
        <View style={styles.settingsSection}>
          <SectionHeader icon={Settings} title="Settings" colors={colors} />

          <View style={styles.cardWrapper}>
            <QuestPreferences onSettingUpdate={showSuccessNotification} />
          </View>
          <View style={styles.cardWrapper}>
            <NotificationSettings onSettingUpdate={showSuccessNotification} />
          </View>
          <View style={styles.cardWrapper}>
            <ThemeToggle />
          </View>
          <View style={styles.cardWrapper}>
            <PrivacySettings onSettingUpdate={showSuccessNotification} />
          </View>
        </View>

        {/* Help & Support Section */}
        <HelpCard colors={colors} onPress={handleHelpSupport} />

        {/* Danger Zone Section */}
        <View style={styles.dangerSection}>
          <SectionHeader
            icon={Settings}
            title="Account Actions"
            colors={colors}
          />

          <ActionCard
            icon={LogOut}
            title="Sign Out"
            description="Sign out of your account"
            color={colors.warning}
            onPress={handleSignOut}
            loading={isSigningOut}
            colors={colors}
          />

          <ActionCard
            icon={Trash2}
            title="Delete Account"
            description="Permanently remove your account and all data"
            color={colors.error}
            onPress={handleDeleteAccount}
            loading={isDeletingAccount}
            colors={colors}
          />
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Account Deletion Dialog */}
      <AccountDeletionDialog
        visible={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  header: {
    alignItems: 'center',
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  name: {
    marginBottom: Spacing.xs,
  },
  settingsSection: {
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  helpCard: {
    marginBottom: Spacing.xl,
  },
  helpButton: {
    minHeight: 'auto',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderRadius: 0,
    shadowOpacity: 0,
    elevation: 0,
    backgroundColor: 'transparent',
    justifyContent: 'flex-start',
  },
  helpContent: {
    width: '100%',
    alignItems: 'flex-start',
  },
  helpLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  helpIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  dangerSection: {
    marginBottom: Spacing.xl,
    gap: Spacing.lg,
  },
  actionCard: {
    borderWidth: 1,
  },
  actionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  actionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  actionTextContainer: {
    flex: 1,
  },
  actionTitle: {
    marginBottom: Spacing.xs,
  },
  actionButton: {
    borderWidth: 1,
  },
  actionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  actionButtonText: {
    fontWeight: '600',
  },
  bottomPadding: {
    height: Spacing.xl,
  },
  cardWrapper: {
    marginBottom: Spacing.lg,
  },
});

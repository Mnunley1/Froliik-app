import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { AppText } from '@/components/ui/Typography';
import { BorderRadius, Spacing } from '@/constants/colors';
import { useThemeColors } from '@/hooks/useColorScheme';
import { zodResolver } from '@hookform/resolvers/zod';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ArrowLeft, CheckCircle, Key, Mail, Target } from 'lucide-react-native';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { z } from 'zod';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordScreen() {
  const colors = useThemeColors();
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [authError, setAuthError] = useState<string>('');

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordForm) => {
    setIsLoading(true);
    setAuthError('');

    try {
      // For now, we'll simulate the email sending
      console.log('Password reset requested for:', data.email);
      setEmailSent(true);
    } catch (error) {
      setAuthError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={[colors.background, colors.surface]}
          style={styles.gradient}
        >
          <View style={styles.successContainer}>
            <View
              style={{
                ...styles.iconContainer,
                backgroundColor: colors.success + '20',
              }}
            >
              <CheckCircle size={48} color={colors.success} strokeWidth={1.5} />
            </View>

            <AppText variant="h1" align="center" style={styles.title}>
              Check your email
            </AppText>

            <AppText
              variant="body"
              color="secondary"
              align="center"
              style={styles.subtitle}
            >
              We've sent a password reset link to your email address. Follow the
              instructions in the email to reset your password.
            </AppText>

            <Button
              title="Back to Sign In"
              onPress={() => router.push('/(auth)/login')}
              size="md"
              style={styles.backButton}
            />
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[colors.background, colors.surface]}
        style={styles.gradient}
      >
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Button
              title=""
              onPress={() => router.back()}
              variant="ghost"
              style={styles.backButtonHeader}
            >
              <ArrowLeft
                size={24}
                color={colors.text.primary}
                strokeWidth={2}
              />
            </Button>

            <View
              style={{
                ...styles.logoContainer,
                backgroundColor: colors.primary + '20',
              }}
            >
              <Key size={32} color={colors.primary} strokeWidth={1.5} />
            </View>

            <AppText variant="h1" align="center" style={styles.title}>
              Reset Password
            </AppText>

            <AppText
              variant="body"
              color="secondary"
              align="center"
              style={styles.subtitle}
            >
              Enter your email address and we'll send you a link to reset your
              password
            </AppText>
          </View>

          <Card style={{ ...styles.formCard, backgroundColor: colors.surface }}>
            <View style={styles.formHeader}>
              <Target size={24} color={colors.primary} strokeWidth={2} />
              <AppText variant="h3" style={styles.formTitle}>
                Reset Your Password
              </AppText>
            </View>

            <View style={styles.form}>
              {authError && <ErrorMessage message={authError} />}

              <View style={styles.inputGroup}>
                <AppText
                  variant="body"
                  style={{ ...styles.inputLabel, color: colors.text.secondary }}
                >
                  Email Address
                </AppText>
                <Controller
                  control={control}
                  name="email"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <View
                      style={[
                        styles.inputContainer,
                        {
                          backgroundColor: colors.surface,
                          borderColor: colors.border,
                        },
                        errors.email && { borderColor: colors.error },
                      ]}
                    >
                      <Mail
                        size={20}
                        color={colors.text.muted}
                        style={styles.inputIcon}
                      />
                      <TextInput
                        style={{ ...styles.input, color: colors.text.primary }}
                        placeholder="Enter your email"
                        placeholderTextColor={colors.text.muted}
                        value={value}
                        onChangeText={(text) => {
                          onChange(text);
                          if (authError) setAuthError('');
                        }}
                        onBlur={onBlur}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        autoFocus={true}
                      />
                    </View>
                  )}
                />
                {errors.email && (
                  <AppText
                    variant="caption"
                    style={{ color: colors.error, marginTop: Spacing.xs }}
                  >
                    {errors.email.message}
                  </AppText>
                )}
              </View>

              <Button
                title={isLoading ? 'Sending...' : 'Send Reset Link'}
                onPress={handleSubmit(onSubmit)}
                disabled={isLoading}
                style={styles.submitButton}
                size="md"
              />

              <View style={styles.footer}>
                <AppText variant="body" color="secondary">
                  Remember your password?{' '}
                </AppText>
                <TouchableOpacity
                  onPress={() => router.push('/(auth)/login')}
                  style={styles.signInLink}
                >
                  <AppText variant="body" color="primary">
                    Sign in
                  </AppText>
                </TouchableOpacity>
              </View>
            </View>
          </Card>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  backButtonHeader: {
    position: 'absolute',
    top: Spacing.lg,
    left: Spacing.lg,
    zIndex: 1,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    lineHeight: 22,
  },
  formCard: {
    margin: Spacing.lg,
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  formTitle: {
    marginLeft: Spacing.sm,
    fontWeight: '600',
  },
  form: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  inputLabel: {
    marginBottom: Spacing.sm,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    height: 56,
  },
  inputIcon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 16,
    height: '100%',
  },
  submitButton: {
    marginBottom: Spacing.lg,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signInLink: {
    paddingHorizontal: 0,
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  backButton: {
    marginTop: Spacing.xl,
  },
});

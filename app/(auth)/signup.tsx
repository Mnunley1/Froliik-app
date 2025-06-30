import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { AppText } from '@/components/ui/Typography';
import { BorderRadius, Spacing } from '@/constants/colors';
import { useThemeColors } from '@/hooks/useColorScheme';
import { useSignUp } from '@clerk/clerk-expo';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Sparkles,
  Target,
  User,
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SignupScreen() {
  const colors = useThemeColors();
  const { isLoaded, signUp, setActive } = useSignUp();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [pendingVerification, setPendingVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');

  const handleSignUp = async () => {
    if (!isLoaded) return;

    // Validation
    if (!fullName.trim()) {
      setError('Full name is required');
      return;
    }

    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address');
      return;
    }

    if (!password) {
      setError('Password is required');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      console.log('Starting signup process...');

      // Start sign-up process using email and password provided
      await signUp.create({
        emailAddress: email.trim(),
        password,
      });

      console.log('Signup created, preparing email verification...');

      // Send user an email with verification code
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });

      console.log(
        'Email verification prepared, setting pending verification...',
      );

      // Set 'pendingVerification' to true to display second form
      setPendingVerification(true);
    } catch (err) {
      console.error('Sign up error:', err);

      // Provide more specific error messages
      if (err instanceof Error) {
        if (err.message.includes('email')) {
          setError('Please enter a valid email address');
        } else if (err.message.includes('password')) {
          setError('Password must be at least 8 characters long');
        } else if (err.message.includes('already exists')) {
          setError('An account with this email already exists');
        } else if (err.message.includes('network')) {
          setError('Network error. Please check your connection');
        } else {
          setError(`Signup failed: ${err.message}`);
        }
      } else {
        setError('Failed to create account. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailVerification = async () => {
    if (!isLoaded) return;

    if (!verificationCode.trim()) {
      setError('Please enter the verification code');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      console.log('Attempting email verification...');

      // Use the code the user provided to attempt verification
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code: verificationCode.trim(),
      });

      console.log('Verification result:', signUpAttempt);

      // If verification was completed, set the session to active
      if (signUpAttempt.status === 'complete') {
        console.log('Email verification completed successfully');

        // Set the user's full name as a custom attribute after verification
        if (fullName.trim()) {
          try {
            console.log('Setting user metadata...');
            await signUp.update({
              unsafeMetadata: {
                fullName: fullName.trim(),
              },
            });
            console.log('User metadata set successfully');
          } catch (metadataError) {
            console.warn('Failed to set user name:', metadataError);
          }
        }

        await setActive({ session: signUpAttempt.createdSessionId });
        console.log('Session activated, navigating to onboarding');
        router.replace('/(onboarding)');
      } else {
        // If the status is not complete, check why
        console.error(
          'Verification incomplete:',
          JSON.stringify(signUpAttempt, null, 2),
        );
        setError('Verification failed. Please try again.');
      }
    } catch (err) {
      console.error('Email verification error:', err);
      setError('Verification failed. Please check your code and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = () => {
    router.push('/(auth)/login');
  };

  const handleBack = () => {
    if (pendingVerification) {
      setPendingVerification(false);
      setVerificationCode('');
    } else {
      router.back();
    }
  };

  // Show email verification form if needed
  if (pendingVerification) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={[colors.background, colors.surface]}
          style={styles.gradient}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.header}>
              <Button
                title=""
                onPress={handleBack}
                variant="ghost"
                style={styles.backButton}
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
                  backgroundColor: colors.success + '20',
                }}
              >
                <Mail size={32} color={colors.success} strokeWidth={1.5} />
              </View>
              <AppText variant="h1" style={styles.title}>
                Verify Email
              </AppText>
              <AppText variant="body" color="secondary" style={styles.subtitle}>
                We sent a verification code to {email}
              </AppText>
            </View>

            <Card
              style={{
                ...styles.formContainer,
                backgroundColor: colors.surface,
              }}
            >
              <View style={styles.formHeader}>
                <Target size={24} color={colors.primary} strokeWidth={2} />
                <AppText variant="h3" style={styles.formTitle}>
                  Enter Code
                </AppText>
              </View>

              <View style={styles.inputGroup}>
                <AppText
                  variant="body"
                  style={{ ...styles.inputLabel, color: colors.text.secondary }}
                >
                  Verification Code
                </AppText>
                <View
                  style={[
                    styles.inputContainer,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Mail
                    size={20}
                    color={colors.text.muted}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={{ ...styles.input, color: colors.text.primary }}
                    placeholder="Enter 6-digit code"
                    placeholderTextColor={colors.text.muted}
                    value={verificationCode}
                    onChangeText={setVerificationCode}
                    keyboardType="number-pad"
                    autoFocus
                    maxLength={6}
                  />
                </View>
              </View>

              {error ? <ErrorMessage message={error} /> : null}

              <Button
                title={isLoading ? 'Verifying...' : 'Verify Email'}
                onPress={handleEmailVerification}
                disabled={isLoading || !verificationCode.trim()}
                style={styles.primaryButton}
                size="md"
              />

              <View style={styles.footer}>
                <AppText variant="body" color="secondary">
                  Didn't receive the code?{' '}
                </AppText>
                <TouchableOpacity
                  onPress={handleSignUp}
                  style={styles.resendLink}
                >
                  <AppText variant="body" color="primary">
                    Resend
                  </AppText>
                </TouchableOpacity>
              </View>
            </Card>
          </ScrollView>
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
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <View
              style={{
                ...styles.logoContainer,
                backgroundColor: colors.primary + '20',
              }}
            >
              <Sparkles size={32} color={colors.primary} strokeWidth={1.5} />
            </View>
            <AppText variant="h1" style={styles.title}>
              Join the Quest
            </AppText>
            <AppText
              variant="h3"
              style={{ ...styles.brandName, color: colors.primary }}
            >
              Froliik
            </AppText>
            <AppText variant="body" color="secondary" style={styles.subtitle}>
              Start your journey of personal growth and achievement
            </AppText>
          </View>

          <Card
            style={{ ...styles.formContainer, backgroundColor: colors.surface }}
          >
            <View style={styles.formHeader}>
              <Target size={24} color={colors.primary} strokeWidth={2} />
              <AppText variant="h3" style={styles.formTitle}>
                Create Account
              </AppText>
            </View>

            <View style={styles.inputGroup}>
              <AppText
                variant="body"
                style={{ ...styles.inputLabel, color: colors.text.secondary }}
              >
                Full Name
              </AppText>
              <View
                style={[
                  styles.inputContainer,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                <User
                  size={20}
                  color={colors.text.muted}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={{ ...styles.input, color: colors.text.primary }}
                  placeholder="Enter your full name"
                  placeholderTextColor={colors.text.muted}
                  value={fullName}
                  onChangeText={setFullName}
                  autoCorrect={false}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <AppText
                variant="body"
                style={{ ...styles.inputLabel, color: colors.text.secondary }}
              >
                Email Address
              </AppText>
              <View
                style={[
                  styles.inputContainer,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
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
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoCorrect={false}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <AppText
                variant="body"
                style={{ ...styles.inputLabel, color: colors.text.secondary }}
              >
                Password
              </AppText>
              <View
                style={[
                  styles.inputContainer,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Lock
                  size={20}
                  color={colors.text.muted}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={{ ...styles.input, color: colors.text.primary }}
                  placeholder="Create a password"
                  placeholderTextColor={colors.text.muted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  {showPassword ? (
                    <EyeOff size={20} color={colors.text.muted} />
                  ) : (
                    <Eye size={20} color={colors.text.muted} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <AppText
                variant="body"
                style={{ ...styles.inputLabel, color: colors.text.secondary }}
              >
                Confirm Password
              </AppText>
              <View
                style={[
                  styles.inputContainer,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Lock
                  size={20}
                  color={colors.text.muted}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={{ ...styles.input, color: colors.text.primary }}
                  placeholder="Confirm your password"
                  placeholderTextColor={colors.text.muted}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeButton}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} color={colors.text.muted} />
                  ) : (
                    <Eye size={20} color={colors.text.muted} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {error ? <ErrorMessage message={error} /> : null}

            <Button
              title={isLoading ? 'Creating Account...' : 'Create Account'}
              onPress={handleSignUp}
              disabled={
                isLoading ||
                !fullName.trim() ||
                !email.trim() ||
                !password ||
                !confirmPassword
              }
              style={styles.primaryButton}
              size="md"
            />

            <View style={styles.divider}>
              <View
                style={{
                  ...styles.dividerLine,
                  backgroundColor: colors.border,
                }}
              />
              <AppText
                variant="caption"
                color="muted"
                style={styles.dividerText}
              >
                or
              </AppText>
              <View
                style={{
                  ...styles.dividerLine,
                  backgroundColor: colors.border,
                }}
              />
            </View>

            <View style={styles.footer}>
              <AppText variant="body" color="secondary">
                Already have an account?{' '}
              </AppText>
              <TouchableOpacity
                onPress={handleSignIn}
                style={styles.signInLink}
              >
                <AppText variant="body" color="primary">
                  Sign in
                </AppText>
              </TouchableOpacity>
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
  scrollContent: {
    flexGrow: 1,
    paddingBottom: Spacing.xxl,
  },
  header: {
    alignItems: 'center',
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  backButton: {
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
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  brandName: {
    marginBottom: Spacing.sm,
    fontWeight: '700',
  },
  subtitle: {
    textAlign: 'center',
    lineHeight: 22,
  },
  formContainer: {
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
  eyeButton: {
    padding: Spacing.xs,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 32,
    minHeight: 32,
  },
  primaryButton: {
    marginBottom: Spacing.lg,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: Spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signInLink: {
    paddingHorizontal: 0,
  },
  resendLink: {
    paddingHorizontal: 0,
  },
});

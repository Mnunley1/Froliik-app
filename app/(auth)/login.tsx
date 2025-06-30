import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { AppText } from '@/components/ui/Typography';
import { BorderRadius, Spacing } from '@/constants/colors';
import { useThemeColors } from '@/hooks/useColorScheme';
import { useSignIn } from '@clerk/clerk-expo';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Eye, EyeOff, Lock, Mail, Sparkles, Target } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const colors = useThemeColors();
  const { signIn, setActive, isLoaded } = useSignIn();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignIn = async () => {
    if (!isLoaded) return;

    setIsLoading(true);
    setError('');

    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        router.replace('/(tabs)');
      } else {
        setError('Sign in failed. Please try again.');
      }
    } catch (err) {
      console.error('Sign in error:', err);
      setError('Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = () => {
    router.push('/(auth)/signup');
  };

  const handleForgotPassword = () => {
    router.push('/(auth)/forgot-password');
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[colors.background, colors.surface]}
        style={styles.gradient}
      >
        <KeyboardAvoidingView
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header Section */}
            <View style={styles.header}>
              <View
                style={[
                  styles.logoContainer,
                  { backgroundColor: colors.primary + '20' },
                ]}
              >
                <Sparkles size={32} color={colors.primary} strokeWidth={1.5} />
              </View>
              <AppText variant="h1" style={styles.title}>
                Welcome Back
              </AppText>
              <AppText
                variant="h3"
                style={{ ...styles.brandName, color: colors.primary }}
              >
                Froliik
              </AppText>
              <AppText variant="body" color="secondary" style={styles.subtitle}>
                Continue your quest for personal growth
              </AppText>
            </View>

            {/* Form Section */}
            <Card
              style={{
                ...styles.formContainer,
                backgroundColor: colors.surface,
              }}
            >
              <View style={styles.formHeader}>
                <Target size={24} color={colors.primary} strokeWidth={2} />
                <AppText variant="h3" style={styles.formTitle}>
                  Sign In
                </AppText>
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
                    style={[styles.input, { color: colors.text.primary }]}
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
                    style={[styles.input, { color: colors.text.primary }]}
                    placeholder="Enter your password"
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

              <TouchableOpacity
                onPress={handleForgotPassword}
                style={styles.forgotPasswordLink}
              >
                <AppText variant="body" color="primary">
                  Forgot Password?
                </AppText>
              </TouchableOpacity>

              {error ? <ErrorMessage message={error} /> : null}

              <Button
                title={isLoading ? 'Signing in...' : 'Sign In'}
                onPress={handleSignIn}
                disabled={isLoading || !email || !password}
                style={styles.signInButton}
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
                  Don't have an account?{' '}
                </AppText>
                <TouchableOpacity
                  onPress={handleSignUp}
                  style={styles.signUpLink}
                >
                  <AppText variant="body" color="primary">
                    Sign up
                  </AppText>
                </TouchableOpacity>
              </View>
            </Card>

            {/* Decorative Circle Under Form */}
            <View style={styles.circleContainer}>
              <Image
                source={require('../../assets/images/black_circle_360x360.png')}
                style={styles.circleImage}
                resizeMode="contain"
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
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
  keyboardAvoidingView: {
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
  forgotPasswordLink: {
    alignSelf: 'flex-end',
    marginBottom: Spacing.lg,
  },
  signInButton: {
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
  signUpLink: {
    paddingHorizontal: 0,
  },
  circleContainer: {
    position: 'absolute',
    top: Spacing.lg,
    left: Spacing.lg,
    zIndex: 1,
  },
  circleImage: {
    width: 60,
    height: 60,
    opacity: 1,
  },
});

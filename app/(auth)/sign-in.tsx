import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { Link, router } from 'expo-router';
import { Eye, EyeOff, Mail, Lock, Loader } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { LoginCredentials } from '@/types/auth';
import SocialLoginButtons from '@/components/SocialLoginButtons';
import DebugPanel from '@/components/DebugPanel';

export default function SignInScreen() {
  const { signIn, signInWithSocial, signInWithDemo, isLoading, error, clearError, isDemoMode, signOut } = useAuth();
  const [formData, setFormData] = useState<LoginCredentials>({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [showDebug, setShowDebug] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignIn = async () => {
    clearError();
    
    if (!validateForm()) {
      return;
    }

    try {
      await signIn(formData);
      router.replace('/(tabs)');
    } catch (error) {
      // Error is handled by the context
      if (Platform.OS !== 'web') {
        Alert.alert('Sign In Failed', 'Please check your credentials and try again.');
      }
    }
  };

  const handleSocialSignIn = async (provider: 'google' | 'apple') => {
    clearError();
    
    try {
      await signInWithSocial(provider);
      router.replace('/(tabs)');
    } catch (error) {
      // Error is handled by the context
      if (Platform.OS !== 'web') {
        Alert.alert(
          `${provider.charAt(0).toUpperCase() + provider.slice(1)} Sign In Failed`,
          'Please try again or use a different sign-in method.'
        );
      }
    }
  };

  const handleDemoSignIn = async () => {
    clearError();
    
    try {
      await signInWithDemo();
      router.replace('/(tabs)');
    } catch (error) {
      // Error is handled by the context
    }
  };

  const handleExitDemo = async () => {
    if (isDemoMode) {
      try {
        await signOut();
        // Force a refresh of the sign-in screen
        setFormData({ email: '', password: '', rememberMe: false });
        setErrors({});
        clearError();
      } catch (error) {
        console.error('Error exiting demo:', error);
      }
    }
  };

  const showFeedback = (message: string) => {
    if (Platform.OS !== 'web') {
      Alert.alert('Success', message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header - Updated to be more welcoming */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Welcome to CivicSpark</Text>
            <Text style={styles.headerSubtitle}>
              Connect with neighbors and make a difference in your community
            </Text>
          </View>

          {/* Demo Mode Exit Notice */}
          {isDemoMode && (
            <View style={styles.demoExitNotice}>
              <Text style={styles.demoExitTitle}>🎭 Currently in Demo Mode</Text>
              <Text style={styles.demoExitText}>
                You're viewing sample data. Sign in with a real account to save your progress.
              </Text>
              <TouchableOpacity 
                style={styles.exitDemoButton}
                onPress={handleExitDemo}
                disabled={isLoading}
              >
                <Text style={styles.exitDemoButtonText}>
                  {isLoading ? 'Exiting...' : 'Exit Demo & Sign In'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Debug Panel Toggle */}
          <TouchableOpacity 
            style={styles.debugToggle}
            onPress={() => setShowDebug(!showDebug)}
          >
            <Text style={styles.debugToggleText}>
              {showDebug ? '🔧 Hide Debug' : '🔧 Show Debug Panel'}
            </Text>
          </TouchableOpacity>

          {/* Debug Panel */}
          {showDebug && <DebugPanel />}

          {/* Featured Demo Section - Made more prominent */}
          {!isDemoMode && (
            <View style={styles.demoSection}>
              <View style={styles.demoHeader}>
                <Text style={styles.demoMainTitle}>🚀 Try CivicSpark Now</Text>
                <Text style={styles.demoMainSubtitle}>
                  Experience the full platform with sample data - no account required
                </Text>
              </View>
              
              <TouchableOpacity 
                style={styles.demoCTAButton}
                onPress={handleDemoSignIn}
                disabled={isLoading}
              >
                <Text style={styles.demoCTAButtonText}>
                  {isLoading ? 'Loading...' : 'Start Demo Experience'}
                </Text>
              </TouchableOpacity>
              
              <View style={styles.demoFeatures}>
                <Text style={styles.demoFeaturesTitle}>What you'll explore:</Text>
                <Text style={styles.demoFeature}>• Civic missions and community challenges</Text>
                <Text style={styles.demoFeature}>• Neighborhood circles and discussions</Text>
                <Text style={styles.demoFeature}>• Local leader discovery and endorsements</Text>
                <Text style={styles.demoFeature}>• Achievement system and civic scoring</Text>
              </View>
            </View>
          )}

          {/* Divider */}
          {!isDemoMode && (
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or sign in to your account</Text>
              <View style={styles.dividerLine} />
            </View>
          )}

          {/* Real Account Section */}
          {!isDemoMode && (
            <View style={styles.realAccountSection}>
              <Text style={styles.realAccountTitle}>🔐 Have an Account?</Text>
              <Text style={styles.realAccountText}>
                Sign in to save your progress and connect with your actual community
              </Text>
            </View>
          )}

          {/* Error Display */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Social Login Buttons */}
          {!isDemoMode && (
            <View style={styles.socialLoginSection}>
              <SocialLoginButtons
                onGoogleSignIn={() => handleSocialSignIn('google')}
                onAppleSignIn={() => handleSocialSignIn('apple')}
                isLoading={isLoading}
              />
            </View>
          )}

          {/* Email/Password Sign In Form */}
          {!isDemoMode && (
            <View style={styles.form}>
              {/* Email Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email Address</Text>
                <View style={[styles.inputContainer, errors.email && styles.inputError]}>
                  <Mail size={20} color={Colors.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your email"
                    placeholderTextColor={Colors.textMuted}
                    value={formData.email}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, email: text.toLowerCase().trim() }))}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!isLoading}
                  />
                </View>
                {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
              </View>

              {/* Password Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <View style={[styles.inputContainer, errors.password && styles.inputError]}>
                  <Lock size={20} color={Colors.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your password"
                    placeholderTextColor={Colors.textMuted}
                    value={formData.password}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, password: text }))}
                    secureTextEntry={!showPassword}
                    editable={!isLoading}
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff size={20} color={Colors.textMuted} />
                    ) : (
                      <Eye size={20} color={Colors.textMuted} />
                    )}
                  </TouchableOpacity>
                </View>
                {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
              </View>

              {/* Remember Me & Forgot Password */}
              <View style={styles.optionsRow}>
                <TouchableOpacity
                  style={styles.rememberMeContainer}
                  onPress={() => setFormData(prev => ({ ...prev, rememberMe: !prev.rememberMe }))}
                >
                  <View style={[styles.checkbox, formData.rememberMe && styles.checkboxChecked]}>
                    {formData.rememberMe && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <Text style={styles.rememberMeText}>Remember me</Text>
                </TouchableOpacity>

                <Link href="/(auth)/forgot-password" asChild>
                  <TouchableOpacity>
                    <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                  </TouchableOpacity>
                </Link>
              </View>

              {/* Sign In Button */}
              <TouchableOpacity
                style={[styles.signInButton, isLoading && styles.signInButtonDisabled]}
                onPress={handleSignIn}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader size={20} color={Colors.secondaryDark} />
                ) : (
                  <Text style={styles.signInButtonText}>Sign In</Text>
                )}
              </TouchableOpacity>

              {/* Sign Up Link */}
              <View style={styles.signUpContainer}>
                <Text style={styles.signUpText}>Don't have an account? </Text>
                <Link href="/(auth)/sign-up" asChild>
                  <TouchableOpacity>
                    <Text style={styles.signUpLink}>Sign Up</Text>
                  </TouchableOpacity>
                </Link>
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
  },
  header: {
    paddingTop: 40,
    paddingBottom: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: Colors.textHeading,
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: Colors.textBody,
    lineHeight: 24,
    textAlign: 'center',
  },
  demoExitNotice: {
    backgroundColor: Colors.warning + '20',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.warning + '40',
  },
  demoExitTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textHeading,
    marginBottom: 8,
  },
  demoExitText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.textBody,
    lineHeight: 20,
    marginBottom: 12,
  },
  exitDemoButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  exitDemoButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: Colors.secondaryDark,
  },
  debugToggle: {
    backgroundColor: '#FF6B35',
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  debugToggleText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  demoSection: {
    backgroundColor: Colors.primary + '15',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: Colors.primary + '30',
  },
  demoHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  demoMainTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: Colors.textHeading,
    marginBottom: 8,
    textAlign: 'center',
  },
  demoMainSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: Colors.textBody,
    lineHeight: 22,
    textAlign: 'center',
  },
  demoCTAButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  demoCTAButtonText: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: Colors.secondaryDark,
  },
  demoFeatures: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  demoFeaturesTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textHeading,
    marginBottom: 12,
  },
  demoFeature: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.textBody,
    lineHeight: 20,
    marginBottom: 6,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.textMuted,
    marginHorizontal: 16,
  },
  realAccountSection: {
    backgroundColor: Colors.info + '20',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.info + '40',
  },
  realAccountTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textHeading,
    marginBottom: 8,
  },
  realAccountText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.textBody,
    lineHeight: 20,
  },
  errorContainer: {
    backgroundColor: Colors.error + '20',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.error + '40',
  },
  socialLoginSection: {
    marginBottom: 24,
  },
  form: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textHeading,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundCard,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  inputError: {
    borderColor: Colors.error,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: Colors.textHeading,
  },
  eyeButton: {
    padding: 4,
  },
  errorText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: Colors.error,
    marginTop: 4,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.border,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkmark: {
    fontSize: 12,
    color: Colors.secondaryDark,
    fontFamily: 'Inter-Bold',
  },
  rememberMeText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.textBody,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: Colors.primary,
  },
  signInButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  signInButtonDisabled: {
    opacity: 0.6,
  },
  signInButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: Colors.secondaryDark,
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 20,
  },
  signUpText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.textBody,
  },
  signUpLink: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: Colors.primary,
  },
});
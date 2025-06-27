import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Platform,
} from 'react-native';
import { Link, router } from 'expo-router';
import { Mail, ArrowLeft, Loader, CircleCheck as CheckCircle } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';

export default function ForgotPasswordScreen() {
  const { resetPassword, isLoading, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleResetPassword = async () => {
    clearError();
    
    if (!validateForm()) {
      return;
    }

    try {
      await resetPassword({ email });
      setEmailSent(true);
    } catch (error) {
      // Error is handled by the context
      if (Platform.OS !== 'web') {
        Alert.alert('Reset Failed', 'Please check your email and try again.');
      }
    }
  };

  const handleResendEmail = async () => {
    await handleResetPassword();
  };

  if (emailSent) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={Colors.textHeading} />
          </TouchableOpacity>

          <View style={styles.successContainer}>
            <View style={styles.successIcon}>
              <CheckCircle size={64} color={Colors.success} />
            </View>
            
            <Text style={styles.successTitle}>Check Your Email</Text>
            <Text style={styles.successMessage}>
              We've sent password reset instructions to:
            </Text>
            <Text style={styles.emailText}>{email}</Text>
            
            <Text style={styles.instructionsText}>
              Click the link in the email to reset your password. If you don't see the email, check your spam folder.
            </Text>

            <TouchableOpacity
              style={styles.resendButton}
              onPress={handleResendEmail}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader size={20} color={Colors.primary} />
              ) : (
                <Text style={styles.resendButtonText}>Resend Email</Text>
              )}
            </TouchableOpacity>

            <Link href="/(auth)/sign-in" asChild>
              <TouchableOpacity style={styles.backToSignInButton}>
                <Text style={styles.backToSignInText}>Back to Sign In</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={Colors.textHeading} />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.headerTitle}>Forgot Password?</Text>
          <Text style={styles.headerSubtitle}>
            No worries! Enter your email address and we'll send you instructions to reset your password.
          </Text>
        </View>

        {/* Error Display */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <View style={[styles.inputContainer, errors.email && styles.inputError]}>
              <Mail size={20} color={Colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor={Colors.textMuted}
                value={email}
                onChangeText={(text) => setEmail(text.toLowerCase().trim())}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
            </View>
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
          </View>

          <TouchableOpacity
            style={[styles.resetButton, isLoading && styles.resetButtonDisabled]}
            onPress={handleResetPassword}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader size={20} color={Colors.secondaryDark} />
            ) : (
              <Text style={styles.resetButtonText}>Send Reset Instructions</Text>
            )}
          </TouchableOpacity>

          <View style={styles.signInContainer}>
            <Text style={styles.signInText}>Remember your password? </Text>
            <Link href="/(auth)/sign-in" asChild>
              <TouchableOpacity>
                <Text style={styles.signInLink}>Sign In</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.backgroundCard,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  header: {
    marginBottom: 32,
  },
  headerTitle: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: Colors.textHeading,
    marginBottom: 12,
  },
  headerSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: Colors.textBody,
    lineHeight: 24,
  },
  errorContainer: {
    backgroundColor: Colors.error + '20',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.error + '40',
  },
  form: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 24,
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
  errorText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: Colors.error,
    marginTop: 4,
  },
  resetButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  resetButtonDisabled: {
    opacity: 0.6,
  },
  resetButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: Colors.secondaryDark,
  },
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signInText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.textBody,
  },
  signInLink: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: Colors.primary,
  },
  // Success state styles
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  successIcon: {
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: Colors.textHeading,
    marginBottom: 12,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: Colors.textBody,
    textAlign: 'center',
    marginBottom: 8,
  },
  emailText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: 20,
  },
  instructionsText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.textBody,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
  },
  resendButton: {
    backgroundColor: Colors.backgroundCard,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
    marginBottom: 16,
  },
  resendButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: Colors.primary,
  },
  backToSignInButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  backToSignInText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textBody,
  },
});
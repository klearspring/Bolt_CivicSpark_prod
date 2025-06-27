import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Mail, CircleCheck as CheckCircle, Loader, ArrowLeft } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';

export default function VerifyEmailScreen() {
  const { user, resendVerificationEmail, isLoading } = useAuth();
  const [emailResent, setEmailResent] = useState(false);

  const handleResendEmail = async () => {
    try {
      await resendVerificationEmail();
      setEmailResent(true);
      
      if (Platform.OS !== 'web') {
        Alert.alert('Email Sent', 'Verification email has been resent to your inbox.');
      }
    } catch (error) {
      if (Platform.OS !== 'web') {
        Alert.alert('Error', 'Failed to resend verification email. Please try again.');
      }
    }
  };

  const handleContinue = () => {
    // For demo purposes, allow users to continue without verification
    router.replace('/(tabs)');
  };

  const handleBackToSignIn = () => {
    router.replace('/(auth)/sign-in');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBackToSignIn}
        >
          <ArrowLeft size={24} color={Colors.textHeading} />
        </TouchableOpacity>

        <View style={styles.iconContainer}>
          <View style={styles.emailIcon}>
            <Mail size={64} color={Colors.primary} />
          </View>
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.title}>Verify Your Email</Text>
          <Text style={styles.message}>
            We've sent a verification link to:
          </Text>
          <Text style={styles.emailText}>{user?.email}</Text>
          
          <Text style={styles.instructions}>
            Click the link in the email to verify your account. This helps us keep your account secure and ensures you receive important community updates.
          </Text>
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.resendButton, emailResent && styles.resentButton]}
            onPress={handleResendEmail}
            disabled={isLoading || emailResent}
          >
            {isLoading ? (
              <Loader size={20} color={Colors.primary} />
            ) : emailResent ? (
              <>
                <CheckCircle size={20} color={Colors.success} />
                <Text style={[styles.resendButtonText, { color: Colors.success }]}>
                  Email Sent!
                </Text>
              </>
            ) : (
              <Text style={styles.resendButtonText}>Resend Verification Email</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleContinue}
          >
            <Text style={styles.continueButtonText}>Continue to App</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.signInButton}
            onPress={handleBackToSignIn}
          >
            <Text style={styles.signInButtonText}>Back to Sign In</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.helpContainer}>
          <Text style={styles.helpTitle}>Need Help?</Text>
          <Text style={styles.helpText}>
            • Check your spam or junk folder
          </Text>
          <Text style={styles.helpText}>
            • Make sure you entered the correct email address
          </Text>
          <Text style={styles.helpText}>
            • Contact support if you continue having issues
          </Text>
        </View>

        <View style={styles.demoNotice}>
          <Text style={styles.demoTitle}>🚀 Demo Mode</Text>
          <Text style={styles.demoText}>
            For testing purposes, you can continue to the app without email verification. In production, email verification would be required for security.
          </Text>
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
    alignSelf: 'flex-start',
  },
  iconContainer: {
    alignItems: 'center',
    marginVertical: 40,
  },
  emailIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.primary + '40',
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: Colors.textHeading,
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
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
  instructions: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.textBody,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  actionsContainer: {
    marginBottom: 32,
  },
  resendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.backgroundCard,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primary,
    marginBottom: 12,
    gap: 8,
  },
  resentButton: {
    borderColor: Colors.success,
    backgroundColor: Colors.success + '20',
  },
  resendButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: Colors.primary,
  },
  continueButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  continueButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: Colors.secondaryDark,
  },
  signInButton: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signInButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textBody,
  },
  helpContainer: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  helpTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textHeading,
    marginBottom: 12,
  },
  helpText: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: Colors.textBody,
    marginBottom: 4,
    lineHeight: 18,
  },
  demoNotice: {
    backgroundColor: Colors.info + '20',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.info + '40',
  },
  demoTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textHeading,
    marginBottom: 8,
  },
  demoText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: Colors.textBody,
    lineHeight: 16,
  },
});
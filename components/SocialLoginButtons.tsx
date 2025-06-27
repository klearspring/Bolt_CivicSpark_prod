import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Alert } from 'react-native';
import { Colors } from '@/constants/Colors';

interface SocialLoginButtonsProps {
  onGoogleSignIn: () => void;
  onAppleSignIn: () => void;
  isLoading: boolean;
}

export default function SocialLoginButtons({ 
  onGoogleSignIn, 
  onAppleSignIn, 
  isLoading 
}: SocialLoginButtonsProps) {
  
  const handleAppleSignIn = () => {
    if (Platform.OS === 'web') {
      Alert.alert(
        'Apple Sign-In Not Available',
        'Apple Sign-In is only available on iOS devices. Please use Google Sign-In or email/password authentication.',
        [{ text: 'OK' }]
      );
      return;
    }
    onAppleSignIn();
  };

  return (
    <View style={styles.container}>
      {/* Google Sign-In Button */}
      <TouchableOpacity
        style={[styles.socialButton, styles.googleButton]}
        onPress={onGoogleSignIn}
        disabled={isLoading}
      >
        <View style={styles.googleIcon}>
          <Text style={styles.googleIconText}>G</Text>
        </View>
        <Text style={styles.googleButtonText}>Continue with Google</Text>
      </TouchableOpacity>

      {/* Apple Sign-In Button (iOS only, show on all platforms but handle appropriately) */}
      <TouchableOpacity
        style={[styles.socialButton, styles.appleButton]}
        onPress={handleAppleSignIn}
        disabled={isLoading}
      >
        <View style={styles.appleIcon}>
          <Text style={styles.appleIconText}>🍎</Text>
        </View>
        <Text style={styles.appleButtonText}>
          {Platform.OS === 'ios' ? 'Continue with Apple' : 'Continue with Apple (iOS only)'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  googleButton: {
    backgroundColor: Colors.backgroundCard,
    borderColor: Colors.border,
  },
  googleIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4285F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleIconText: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: Colors.white,
  },
  googleButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textHeading,
  },
  appleButton: {
    backgroundColor: Colors.secondaryDark,
    borderColor: Colors.secondaryDark,
  },
  appleIcon: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appleIconText: {
    fontSize: 16,
  },
  appleButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: Colors.white,
  },
});
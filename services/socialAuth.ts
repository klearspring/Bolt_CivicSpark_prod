import { Platform } from 'react-native';

interface SocialAuthResult {
  success: boolean;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    provider: 'google' | 'apple';
  };
  error?: string;
}

export class SocialAuthService {
  // Google Sign-In (Mock Implementation for Demo)
  static async signInWithGoogle(): Promise<SocialAuthResult> {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // For demo purposes, return mock user data
      const mockUser = {
        id: 'google_' + Date.now(),
        email: 'demo.google@civicspark.com',
        firstName: 'Google',
        lastName: 'User',
        avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2',
        provider: 'google' as const,
      };

      return {
        success: true,
        user: mockUser,
      };
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Google sign-in failed',
      };
    }
  }

  // Apple Sign-In (Mock Implementation for Demo)
  static async signInWithApple(): Promise<SocialAuthResult> {
    try {
      if (Platform.OS === 'web') {
        return {
          success: false,
          error: 'Apple Sign-In is not available on web. Please use Google Sign-In or email/password.',
        };
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // For demo purposes, return mock user data
      const mockUser = {
        id: 'apple_' + Date.now(),
        email: 'demo.apple@civicspark.com',
        firstName: 'Apple',
        lastName: 'User',
        avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2',
        provider: 'apple' as const,
      };

      return {
        success: true,
        user: mockUser,
      };
    } catch (error) {
      console.error('Apple Sign-In Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Apple sign-in failed',
      };
    }
  }

  // Generic social sign-in handler
  static async signInWithProvider(provider: 'google' | 'apple'): Promise<SocialAuthResult> {
    switch (provider) {
      case 'google':
        return this.signInWithGoogle();
      case 'apple':
        return this.signInWithApple();
      default:
        return {
          success: false,
          error: 'Unsupported authentication provider',
        };
    }
  }
}
import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Platform } from 'react-native';
import { User, AuthState, LoginCredentials, RegisterData, ResetPasswordData, ChangePasswordData, SocialLoginData } from '@/types/auth';
import { AuthService } from '@/services/authService';
import { SocialAuthService } from '@/services/socialAuth';
import { supabase } from '@/lib/supabase';

interface AuthContextType extends AuthState {
  signIn: (credentials: LoginCredentials) => Promise<void>;
  signInWithSocial: (provider: 'google' | 'apple') => Promise<void>;
  signUp: (data: RegisterData) => Promise<{ needsVerification: boolean }>;
  signOut: () => Promise<void>;
  resetPassword: (data: ResetPasswordData) => Promise<void>;
  changePassword: (data: ChangePasswordData) => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  clearError: () => void;
  // Demo mode functions
  signInWithDemo: () => Promise<void>;
  isDemoMode: boolean;
  // Email verification state
  pendingVerificationEmail: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_DEMO_MODE'; payload: boolean }
  | { type: 'SET_PENDING_VERIFICATION'; payload: string | null }
  | { type: 'SIGN_OUT' };

const authReducer = (state: AuthState & { isDemoMode: boolean; pendingVerificationEmail: string | null }, action: AuthAction): AuthState & { isDemoMode: boolean; pendingVerificationEmail: string | null } => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        isLoading: false,
        error: null,
        pendingVerificationEmail: action.payload ? null : state.pendingVerificationEmail,
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    case 'SET_DEMO_MODE':
      return { ...state, isDemoMode: action.payload };
    case 'SET_PENDING_VERIFICATION':
      return { ...state, pendingVerificationEmail: action.payload };
    case 'SIGN_OUT':
      return {
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        isDemoMode: false,
        pendingVerificationEmail: null,
      };
    default:
      return state;
  }
};

const initialState: AuthState & { isDemoMode: boolean; pendingVerificationEmail: string | null } = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  isDemoMode: false,
  pendingVerificationEmail: null,
};

// In-memory only storage for demo mode (no persistence at all)
class DemoStorage {
  private static memoryStorage: { [key: string]: string } = {};
  private static isInitialized = false;

  static init() {
    if (!this.isInitialized) {
      // Always start with clean storage
      this.memoryStorage = {};
      this.isInitialized = true;
      console.log('🧹 Demo storage initialized (clean slate)');
    }
  }

  static getItem(key: string): string | null {
    this.init();
    return this.memoryStorage[key] || null;
  }

  static setItem(key: string, value: string): void {
    this.init();
    this.memoryStorage[key] = value;
    console.log(`📝 Demo storage set: ${key}`);
  }

  static removeItem(key: string): void {
    this.init();
    delete this.memoryStorage[key];
    console.log(`🗑️ Demo storage removed: ${key}`);
  }

  static clear(): void {
    this.memoryStorage = {};
    console.log('🧹 Demo storage completely cleared');
    
    // Also clear any browser storage that might exist
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      try {
        window.localStorage?.removeItem('civicspark_demo_mode');
        window.localStorage?.removeItem('civicspark_demo_user');
        window.sessionStorage?.removeItem('civicspark_demo_mode');
        window.sessionStorage?.removeItem('civicspark_demo_user');
        console.log('🧹 Browser storage also cleared');
      } catch (e) {
        console.log('⚠️ Could not clear browser storage (might not be available)');
      }
    }
  }

  static isDemoActive(): boolean {
    this.init();
    return this.getItem('civicspark_demo_mode') === 'true';
  }
}

// Demo user data with Bolt Hackathon Badge as default avatar
const createDemoUser = (): User => ({
  id: 'demo-user-id',
  email: 'demo@civicspark.com',
  firstName: 'Alex',
  lastName: 'Thompson',
  displayName: 'Alex Thompson',
  avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2',
  phoneNumber: '+1 (555) 123-4567',
  authProvider: 'email',
  location: {
    address: '123 Main St',
    city: 'Downtown',
    state: 'CA',
    zipCode: '90210',
    coordinates: {
      latitude: 34.0522,
      longitude: -118.2437,
    },
  },
  preferences: {
    notifications: {
      email: true,
      push: true,
      sms: false,
    },
    privacy: {
      profileVisibility: 'circles',
      locationSharing: true,
      activityVisibility: 'circles',
    },
  },
  civicProfile: {
    joinDate: '2023-12-15',
    totalPoints: 285,
    completedMissions: 5,
    joinedCircles: ['1', '3'],
    achievements: ['1', '2', '3', '4'],
    civicScore: 57,
  },
  verification: {
    emailVerified: true,
    phoneVerified: false,
    identityVerified: false,
  },
  createdAt: '2023-12-15T10:00:00Z',
  updatedAt: '2024-01-15T14:30:00Z',
  lastLoginAt: new Date().toISOString(),
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing session on app start
  useEffect(() => {
    const checkAuthState = async () => {
      try {
        console.log('🔍 Checking authentication state...');
        
        // Always clear any old browser storage first
        DemoStorage.clear();
        
        // Check for real user session (this is the priority)
        const user = await AuthService.getCurrentUser();
        if (user) {
          console.log('✅ Found real user session:', user.id);
          dispatch({ type: 'SET_DEMO_MODE', payload: false });
          dispatch({ type: 'SET_USER', payload: user });
          return;
        }

        // No real session found - always start fresh
        console.log('❌ No real session found - starting fresh');
        dispatch({ type: 'SET_USER', payload: null });
        
      } catch (error) {
        console.error('Auth state check error:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to restore session' });
      }
    };

    checkAuthState();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔐 Auth state change event:', event);
        
        if (event === 'SIGNED_OUT' || !session) {
          // Only clear state if we're not in demo mode
          if (!state.isDemoMode) {
            dispatch({ type: 'SIGN_OUT' });
          }
        } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          try {
            const user = await AuthService.getCurrentUser();
            dispatch({ type: 'SET_DEMO_MODE', payload: false });
            dispatch({ type: 'SET_USER', payload: user });
          } catch (error) {
            console.error('Error getting user after auth change:', error);
          }
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (credentials: LoginCredentials) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });
    
    try {
      const user = await AuthService.signIn(credentials);
      dispatch({ type: 'SET_DEMO_MODE', payload: false }); // Ensure demo mode is disabled
      dispatch({ type: 'SET_USER', payload: user });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Sign in failed' });
      throw error;
    }
  };

  const signInWithDemo = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });
    
    try {
      console.log('🎭 Starting demo sign in...');
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const demoUser = createDemoUser();
      
      // Store demo mode flag in memory only (no persistence)
      DemoStorage.setItem('civicspark_demo_mode', 'true');
      DemoStorage.setItem('civicspark_demo_user', JSON.stringify(demoUser));
      
      console.log('✅ Demo mode activated (memory only)');
      
      dispatch({ type: 'SET_DEMO_MODE', payload: true });
      dispatch({ type: 'SET_USER', payload: demoUser });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Demo sign in failed' });
      throw error;
    }
  };

  const signInWithSocial = async (provider: 'google' | 'apple') => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });
    
    try {
      const result = await SocialAuthService.signInWithProvider(provider);
      
      if (result.success && result.user) {
        // For now, treat social logins as demo users
        // In production, you'd integrate with Supabase social auth
        const demoUser = createDemoUser();
        demoUser.firstName = result.user.firstName;
        demoUser.lastName = result.user.lastName;
        demoUser.displayName = `${result.user.firstName} ${result.user.lastName}`;
        demoUser.email = result.user.email;
        demoUser.avatar = result.user.avatar || 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2';
        demoUser.authProvider = provider;
        
        DemoStorage.setItem('civicspark_demo_mode', 'true');
        DemoStorage.setItem('civicspark_demo_user', JSON.stringify(demoUser));
        
        dispatch({ type: 'SET_DEMO_MODE', payload: true });
        dispatch({ type: 'SET_USER', payload: demoUser });
      } else {
        throw new Error(result.error || `${provider} sign-in failed`);
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : `${provider} sign-in failed` });
      throw error;
    }
  };

  const signUp = async (data: RegisterData): Promise<{ needsVerification: boolean }> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });
    
    try {
      const result = await AuthService.signUp(data);
      
      // Check if the user needs email verification
      if (result.needsVerification) {
        dispatch({ type: 'SET_PENDING_VERIFICATION', payload: data.email });
        dispatch({ type: 'SET_LOADING', payload: false });
        return { needsVerification: true };
      } else {
        dispatch({ type: 'SET_DEMO_MODE', payload: false }); // Ensure demo mode is disabled
        dispatch({ type: 'SET_USER', payload: result.user });
        return { needsVerification: false };
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Sign up failed' });
      throw error;
    }
  };

  const signOut = async () => {
    console.log('🚪 Starting sign out process...');
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      if (state.isDemoMode) {
        console.log('🎭 Signing out from demo mode');
        // Clear demo mode storage
        DemoStorage.clear();
        console.log('🧹 Demo mode storage cleared');
      } else {
        console.log('🔐 Signing out from real account');
        // Sign out from Supabase
        await AuthService.signOut();
        console.log('✅ Supabase sign out completed');
      }
      
      // Force clear all state
      dispatch({ type: 'SIGN_OUT' });
      console.log('✅ Sign out completed successfully');
      
    } catch (error) {
      console.error('❌ Sign out error:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Sign out failed' });
      
      // Even if there's an error, try to clear local state
      dispatch({ type: 'SIGN_OUT' });
      DemoStorage.clear();
    }
  };

  const resetPassword = async (data: ResetPasswordData) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });
    
    try {
      await AuthService.resetPassword(data);
      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Password reset failed' });
      throw error;
    }
  };

  const changePassword = async (data: ChangePasswordData) => {
    if (state.isDemoMode) {
      throw new Error('Password change not available in demo mode');
    }
    
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });
    
    try {
      await AuthService.changePassword(data);
      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Password change failed' });
      throw error;
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (state.isDemoMode) {
      // Update demo user in storage
      if (state.user) {
        const updatedUser = { ...state.user, ...updates };
        DemoStorage.setItem('civicspark_demo_user', JSON.stringify(updatedUser));
        dispatch({ type: 'SET_USER', payload: updatedUser });
      }
      return;
    }
    
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });
    
    try {
      if (!state.user) {
        throw new Error('No user found');
      }
      
      const updatedUser = await AuthService.updateProfile(state.user.id, updates);
      dispatch({ type: 'SET_USER', payload: updatedUser });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Profile update failed' });
      throw error;
    }
  };

  const verifyEmail = async (token: string) => {
    if (state.isDemoMode) {
      throw new Error('Email verification not available in demo mode');
    }
    
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });
    
    try {
      await AuthService.verifyEmail(token);
      
      // After successful verification, try to get the user
      const user = await AuthService.getCurrentUser();
      if (user) {
        dispatch({ type: 'SET_USER', payload: user });
      }
      
      dispatch({ type: 'SET_PENDING_VERIFICATION', payload: null });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Email verification failed' });
      throw error;
    }
  };

  const resendVerificationEmail = async () => {
    if (state.isDemoMode) {
      throw new Error('Email verification not available in demo mode');
    }
    
    const email = state.pendingVerificationEmail || state.user?.email;
    if (!email) throw new Error('No email found');
    
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });
    
    try {
      await AuthService.resendVerificationEmail(email);
      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to resend verification email' });
      throw error;
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value: AuthContextType = {
    ...state,
    signIn,
    signInWithSocial,
    signUp,
    signOut,
    resetPassword,
    changePassword,
    updateProfile,
    verifyEmail,
    resendVerificationEmail,
    clearError,
    signInWithDemo,
    isDemoMode: state.isDemoMode,
    pendingVerificationEmail: state.pendingVerificationEmail,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
import { supabase } from '@/lib/supabase';
import { User, LoginCredentials, RegisterData, ResetPasswordData, ChangePasswordData } from '@/types/auth';
import { Platform } from 'react-native';
import { AchievementService } from './achievementService';

// Default avatar URL for new users - Using Pexels image to avoid Metro issues
const DEFAULT_AVATAR_URL = 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2';

export class AuthService {
  // Sign in with email and password
  static async signIn(credentials: LoginCredentials): Promise<User> {
    console.log('🔐 AuthService.signIn - Starting sign in process');
    console.log('📧 Email:', credentials.email);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) {
      console.error('❌ Sign in error:', error);
      throw new Error(error.message);
    }

    if (!data.user) {
      console.error('❌ No user returned from sign in');
      throw new Error('No user returned from sign in');
    }

    console.log('✅ Sign in successful, user ID:', data.user.id);

    // Get user profile with retry logic
    const profile = await this.getUserProfileWithRetry(data.user.id);
    return this.mapSupabaseUserToUser(data.user, profile);
  }

  // Sign up with email and password
  static async signUp(registerData: RegisterData): Promise<{ user?: User; needsVerification: boolean }> {
    console.log('🚀 AuthService.signUp - Starting registration process');
    console.log('📧 Email:', registerData.email);
    console.log('👤 Name:', registerData.firstName, registerData.lastName);
    console.log('📍 Location:', registerData.location);
    
    // Check if user already exists first
    const { data: existingUser } = await supabase.auth.getUser();
    if (existingUser?.user?.email === registerData.email) {
      throw new Error('You are already signed in with this email. Please sign out first.');
    }

    // For development, disable email confirmation completely
    const signUpData = {
      email: registerData.email,
      password: registerData.password,
      options: {
        data: {
          first_name: registerData.firstName,
          last_name: registerData.lastName,
          display_name: `${registerData.firstName} ${registerData.lastName}`,
          phone_number: registerData.phoneNumber,
          date_of_birth: registerData.dateOfBirth,
          location: registerData.location,
          subscribe_to_newsletter: registerData.subscribeToNewsletter,
        },
        // Completely disable email confirmation for development
        emailRedirectTo: undefined,
      },
    };
    
    console.log('📤 Sending to Supabase (email confirmation disabled for development)');

    const { data, error } = await supabase.auth.signUp(signUpData);

    if (error) {
      console.error('❌ Supabase auth.signUp error:', error);
      console.error('❌ Error code:', error.status);
      console.error('❌ Error message:', error.message);
      
      // Handle specific error cases
      if (error.message.includes('User already registered') || error.message.includes('already been registered')) {
        throw new Error('An account with this email already exists. Please sign in instead or use a different email address.');
      }
      
      throw new Error(error.message);
    }

    if (!data.user) {
      console.error('❌ No user returned from sign up');
      throw new Error('No user returned from sign up');
    }

    console.log('✅ Supabase auth.signUp successful');
    console.log('👤 User ID:', data.user.id);
    console.log('📧 User email:', data.user.email);
    console.log('✉️ Email confirmed:', data.user.email_confirmed_at);
    console.log('🔑 Session exists:', !!data.session);

    // With email confirmation disabled, we should have a session immediately
    if (!data.session) {
      console.log('⚠️ No session returned - this might indicate an issue');
      return { needsVerification: true };
    }

    // Try to get/create the user profile with retry logic
    console.log('🔍 Checking if user profile was created...');
    
    try {
      // Wait longer for the trigger to complete
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      let profile = await this.getUserProfileWithRetry(data.user.id, 3);
      
      if (!profile) {
        console.log('🔧 Profile not found after retries, creating manually...');
        await this.createUserProfile(data.user.id, registerData);
        profile = await this.getUserProfileWithRetry(data.user.id, 2);
      }
      
      // Grant default achievements to new user
      console.log('🏆 Granting default achievements to new user...');
      try {
        await AchievementService.grantDefaultAchievements(data.user.id);
        console.log('✅ Default achievements granted successfully');
      } catch (achievementError) {
        console.error('⚠️ Failed to grant default achievements:', achievementError);
        // Don't fail the signup process if achievements fail
      }
      
      const user = this.mapSupabaseUserToUser(data.user, profile);
      console.log('✅ Registration complete with user profile and default achievements');
      return { user, needsVerification: false };
      
    } catch (profileError) {
      console.error('❌ Error with user profile:', profileError);
      
      // Try to create profile manually
      console.log('🔧 Attempting to create user profile manually...');
      try {
        await this.createUserProfile(data.user.id, registerData);
        console.log('✅ Manual profile creation successful');
        
        // Grant default achievements
        try {
          await AchievementService.grantDefaultAchievements(data.user.id);
          console.log('✅ Default achievements granted successfully');
        } catch (achievementError) {
          console.error('⚠️ Failed to grant default achievements:', achievementError);
        }
        
        const profile = await this.getUserProfileWithRetry(data.user.id, 2);
        const user = this.mapSupabaseUserToUser(data.user, profile);
        return { user, needsVerification: false };
      } catch (createError) {
        console.error('❌ Manual profile creation failed:', createError);
        throw createError;
      }
    }
  }

  // Sign out
  static async signOut(): Promise<void> {
    console.log('🚪 AuthService.signOut - Starting sign out process');
    
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('❌ Sign out error:', error);
      throw new Error(error.message);
    }
    
    console.log('✅ Sign out successful');
  }

  // Reset password
  static async resetPassword(data: ResetPasswordData): Promise<void> {
    console.log('🔄 AuthService.resetPassword - Starting password reset');
    console.log('📧 Email:', data.email);
    
    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: Platform.OS === 'web' 
        ? `${window.location.origin}/reset-password` 
        : 'civicspark://reset-password',
    });

    if (error) {
      console.error('❌ Password reset error:', error);
      throw new Error(error.message);
    }
    
    console.log('✅ Password reset email sent');
  }

  // Change password
  static async changePassword(data: ChangePasswordData): Promise<void> {
    console.log('🔐 AuthService.changePassword - Starting password change');
    
    const { error } = await supabase.auth.updateUser({
      password: data.newPassword,
    });

    if (error) {
      console.error('❌ Password change error:', error);
      throw new Error(error.message);
    }
    
    console.log('✅ Password change successful');
  }

  // Get current user
  static async getCurrentUser(): Promise<User | null> {
    console.log('👤 AuthService.getCurrentUser - Getting current user');
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.log('❌ No current user found');
      return null;
    }

    console.log('✅ Current user found:', user.id);
    
    const profile = await this.getUserProfileWithRetry(user.id);
    return this.mapSupabaseUserToUser(user, profile);
  }

  // Update user profile
  static async updateProfile(userId: string, updates: Partial<User>): Promise<User> {
    console.log('📝 AuthService.updateProfile - Updating profile for user:', userId);
    console.log('📤 Updates:', JSON.stringify(updates, null, 2));
    
    // Update auth user if email is being changed
    if (updates.email) {
      console.log('📧 Updating email in auth...');
      const { error: authError } = await supabase.auth.updateUser({
        email: updates.email,
      });
      if (authError) {
        console.error('❌ Auth email update error:', authError);
        throw new Error(authError.message);
      }
      console.log('✅ Auth email updated');
    }

    // Update profile table
    const profileUpdates: any = {};
    
    if (updates.firstName) profileUpdates.first_name = updates.firstName;
    if (updates.lastName) profileUpdates.last_name = updates.lastName;
    if (updates.displayName) profileUpdates.display_name = updates.displayName;
    if (updates.avatar) profileUpdates.avatar_url = updates.avatar;
    if (updates.phoneNumber) profileUpdates.phone_number = updates.phoneNumber;
    if (updates.dateOfBirth) profileUpdates.date_of_birth = updates.dateOfBirth;
    if (updates.location) profileUpdates.location = updates.location;
    if (updates.preferences) profileUpdates.preferences = updates.preferences;
    if (updates.civicProfile) profileUpdates.civic_profile = updates.civicProfile;
    if (updates.verification) profileUpdates.verification = updates.verification;

    console.log('📤 Profile table updates:', JSON.stringify(profileUpdates, null, 2));

    const { data, error } = await supabase
      .from('user_profiles')
      .update(profileUpdates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('❌ Profile update error:', error);
      throw new Error(error.message);
    }

    console.log('✅ Profile updated successfully');

    // Get updated user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not found');
    }

    return this.mapSupabaseUserToUser(user, data);
  }

  // Verify email (disabled for development)
  static async verifyEmail(token: string): Promise<void> {
    console.log('✉️ AuthService.verifyEmail - Email verification disabled for development');
    throw new Error('Email verification is disabled for development. Users are automatically verified.');
  }

  // Resend verification email (disabled for development)
  static async resendVerificationEmail(email: string): Promise<void> {
    console.log('📧 AuthService.resendVerificationEmail - Email verification disabled for development');
    throw new Error('Email verification is disabled for development. Users are automatically verified.');
  }

  // Private helper methods
  private static async getUserProfile(userId: string) {
    console.log('🔍 Getting user profile for ID:', userId);
    
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('❌ Get user profile error:', error);
      console.error('❌ Error code:', error.code);
      console.error('❌ Error details:', error.details);
      console.error('❌ Error hint:', error.hint);
      throw new Error(error.message);
    }

    if (error && error.code === 'PGRST116') {
      console.log('⚠️ User profile not found (this might be expected for new users)');
      return null;
    }

    console.log('✅ User profile retrieved successfully');
    return data;
  }

  private static async getUserProfileWithRetry(userId: string, maxRetries: number = 3): Promise<any> {
    console.log(`🔄 Getting user profile with retry for ID: ${userId} (max retries: ${maxRetries})`);
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔍 Attempt ${attempt}/${maxRetries} to get user profile`);
        const profile = await this.getUserProfile(userId);
        
        if (profile) {
          console.log(`✅ User profile found on attempt ${attempt}`);
          return profile;
        }
        
        if (attempt < maxRetries) {
          console.log(`⏳ Profile not found, waiting before retry ${attempt + 1}...`);
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // Exponential backoff
        }
      } catch (error) {
        console.error(`❌ Error on attempt ${attempt}:`, error);
        if (attempt === maxRetries) {
          throw error;
        }
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
    
    console.log('❌ User profile not found after all retries');
    return null;
  }

  private static async createUserProfile(userId: string, registerData: RegisterData) {
    console.log('🔧 Creating user profile manually for ID:', userId);
    
    const profileData = {
      id: userId,
      first_name: registerData.firstName,
      last_name: registerData.lastName,
      display_name: `${registerData.firstName} ${registerData.lastName}`,
      avatar_url: DEFAULT_AVATAR_URL, // Use Pexels image to avoid Metro issues
      phone_number: registerData.phoneNumber,
      date_of_birth: registerData.dateOfBirth,
      location: registerData.location,
      preferences: {
        notifications: {
          email: registerData.subscribeToNewsletter || false,
          push: true,
          sms: false,
        },
        privacy: {
          profileVisibility: 'circles',
          locationSharing: true,
          activityVisibility: 'circles',
        },
      },
      civic_profile: {
        joinDate: new Date().toISOString().split('T')[0],
        totalPoints: 0,
        completedMissions: 0,
        joinedCircles: [],
        achievements: [],
        civicScore: 5, // Starting civic score
      },
      verification: {
        emailVerified: true, // Auto-verify for development
        phoneVerified: false,
        identityVerified: false,
      },
    };
    
    console.log('📤 Creating profile with Pexels avatar to avoid Metro issues');

    const { error } = await supabase
      .from('user_profiles')
      .insert(profileData);

    if (error) {
      console.error('❌ Manual profile creation error:', error);
      console.error('❌ Error code:', error.code);
      console.error('❌ Error details:', error.details);
      console.error('❌ Error hint:', error.hint);
      throw new Error(`Profile creation failed: ${error.message}`);
    }
    
    console.log('✅ Manual profile creation successful with Pexels avatar');
  }

  private static mapSupabaseUserToUser(supabaseUser: any, profile: any): User {
    console.log('🗺️ Mapping Supabase user to app user format');
    
    const mappedUser = {
      id: supabaseUser.id,
      email: supabaseUser.email,
      firstName: profile?.first_name || 'User',
      lastName: profile?.last_name || 'Name',
      displayName: profile?.display_name || 'User Name',
      avatar: profile?.avatar_url || DEFAULT_AVATAR_URL, // Ensure Pexels avatar fallback
      phoneNumber: profile?.phone_number,
      dateOfBirth: profile?.date_of_birth,
      authProvider: 'email',
      location: profile?.location || {
        address: '',
        city: '',
        state: '',
        zipCode: '',
      },
      preferences: profile?.preferences || {
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
      civicProfile: profile?.civic_profile || {
        joinDate: profile?.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
        totalPoints: 0,
        completedMissions: 0,
        joinedCircles: [],
        achievements: [],
        civicScore: 5, // Starting civic score
      },
      verification: profile?.verification || {
        emailVerified: true, // Auto-verify for development
        phoneVerified: false,
        identityVerified: false,
      },
      createdAt: profile?.created_at || supabaseUser.created_at,
      updatedAt: profile?.updated_at || supabaseUser.updated_at,
      lastLoginAt: supabaseUser.last_sign_in_at,
    };
    
    console.log('✅ User mapping complete with Pexels avatar');
    return mappedUser;
  }
}
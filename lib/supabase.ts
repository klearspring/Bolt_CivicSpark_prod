import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

console.log('🔧 Supabase Configuration:');
console.log('📍 URL:', supabaseUrl);
console.log('🔑 Anon Key:', supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'MISSING');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables!');
  console.error('❌ EXPO_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'Present' : 'MISSING');
  console.error('❌ EXPO_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Present' : 'MISSING');
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

// Secure storage implementation for mobile platforms
const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    if (Platform.OS === 'web') {
      // Check if we're in a browser environment with localStorage available
      if (typeof window !== 'undefined' && window.localStorage) {
        return localStorage.getItem(key);
      }
      // Return null if localStorage is not available (e.g., in Node.js environment)
      return null;
    }
    return SecureStore.getItemAsync(key);
  },
  setItem: (key: string, value: string) => {
    if (Platform.OS === 'web') {
      // Check if we're in a browser environment with localStorage available
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(key, value);
      }
      // Do nothing if localStorage is not available
    } else {
      SecureStore.setItemAsync(key, value);
    }
  },
  removeItem: (key: string) => {
    if (Platform.OS === 'web') {
      // Check if we're in a browser environment with localStorage available
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem(key);
      }
      // Do nothing if localStorage is not available
    } else {
      SecureStore.deleteItemAsync(key);
    }
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web',
  },
});

console.log('✅ Supabase client initialized successfully');

// Add global error handler for Supabase
supabase.auth.onAuthStateChange((event, session) => {
  console.log('🔐 Auth state change:', event);
  if (session) {
    console.log('👤 Session user:', session.user.id);
  } else {
    console.log('❌ No session');
  }
});

// Database types (generated from Supabase)
export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          first_name: string;
          last_name: string;
          display_name: string;
          avatar_url: string | null;
          phone_number: string | null;
          date_of_birth: string | null;
          location: any;
          preferences: any;
          civic_profile: any;
          verification: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          first_name: string;
          last_name: string;
          display_name: string;
          avatar_url?: string | null;
          phone_number?: string | null;
          date_of_birth?: string | null;
          location?: any;
          preferences?: any;
          civic_profile?: any;
          verification?: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          first_name?: string;
          last_name?: string;
          display_name?: string;
          avatar_url?: string | null;
          phone_number?: string | null;
          date_of_birth?: string | null;
          location?: any;
          preferences?: any;
          civic_profile?: any;
          verification?: any;
          created_at?: string;
          updated_at?: string;
        };
      };
      civic_actions: {
        Row: {
          id: string;
          user_id: string;
          action_type: string;
          title: string;
          description: string | null;
          points: number;
          verified: boolean;
          metadata: any;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          action_type: string;
          title: string;
          description?: string | null;
          points?: number;
          verified?: boolean;
          metadata?: any;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          action_type?: string;
          title?: string;
          description?: string | null;
          points?: number;
          verified?: boolean;
          metadata?: any;
          created_at?: string;
        };
      };
      achievements: {
        Row: {
          id: string;
          user_id: string;
          achievement_id: string;
          unlocked_at: string;
          progress: any;
        };
        Insert: {
          id?: string;
          user_id: string;
          achievement_id: string;
          unlocked_at?: string;
          progress?: any;
        };
        Update: {
          id?: string;
          user_id?: string;
          achievement_id?: string;
          unlocked_at?: string;
          progress?: any;
        };
      };
      communities: {
        Row: {
          id: string;
          user_id: string;
          community_name: string;
          community_type: string;
          member_count: number;
          engagement_level: string;
          missions_completed: number;
          circles_joined: number;
          is_active: boolean;
          location: any;
          joined_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          community_name: string;
          community_type: string;
          member_count?: number;
          engagement_level?: string;
          missions_completed?: number;
          circles_joined?: number;
          is_active?: boolean;
          location?: any;
          joined_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          community_name?: string;
          community_type?: string;
          member_count?: number;
          engagement_level?: string;
          missions_completed?: number;
          circles_joined?: number;
          is_active?: boolean;
          location?: any;
          joined_at?: string;
        };
      };
    };
  };
}
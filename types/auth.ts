export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  avatar?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  authProvider?: 'email' | 'google' | 'apple';
  location: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    coordinates?: {
      latitude: number;
      longitude: number;
      accuracy?: number;
      timestamp?: number;
    };
  };
  preferences: {
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
    privacy: {
      profileVisibility: 'public' | 'circles' | 'private';
      locationSharing: boolean;
      activityVisibility: 'public' | 'circles' | 'private';
    };
  };
  civicProfile: {
    joinDate: string;
    totalPoints: number;
    completedMissions: number;
    joinedCircles: string[];
    achievements: string[];
    civicScore: number;
  };
  verification: {
    emailVerified: boolean;
    phoneVerified: boolean;
    identityVerified: boolean;
  };
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface SocialLoginData {
  provider: 'google' | 'apple';
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
}

export interface RegisterData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  location: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
  agreeToTerms: boolean;
  agreeToPrivacy: boolean;
  subscribeToNewsletter?: boolean;
}

export interface ResetPasswordData {
  email: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

// New interfaces for geolocation functionality
export interface LocationPermissionStatus {
  granted: boolean;
  canAskAgain: boolean;
  status: 'granted' | 'denied' | 'undetermined';
}

export interface GeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  altitudeAccuracy?: number;
  heading?: number;
  speed?: number;
  timestamp: number;
}

export interface LocationError {
  code: number;
  message: string;
}
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Switch, Alert, Platform } from 'react-native';
import { Settings, User, Bell, Shield, Globe, Moon, Sun, Volume2, VolumeX, MapPin, Mail, Phone, Lock, Eye, EyeOff, Trash2, Download, Upload, CircleHelp as HelpCircle, MessageSquare, Star, LogOut, ChevronRight, Check, X } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';

interface SettingItem {
  id: string;
  title: string;
  description?: string;
  icon: any;
  type: 'toggle' | 'navigation' | 'action' | 'selection';
  value?: boolean | string;
  options?: string[];
  onPress?: () => void;
  destructive?: boolean;
}

interface SettingSection {
  title: string;
  items: SettingItem[];
}

export default function SettingsTab() {
  const { user, signOut, isLoading, isDemoMode } = useAuth();
  const [settings, setSettings] = useState({
    // Notification Settings
    pushNotifications: true,
    emailNotifications: true,
    missionReminders: true,
    circleUpdates: true,
    achievementAlerts: true,
    weeklyDigest: false,
    
    // Privacy Settings
    profileVisibility: 'public', // public, circles, private
    locationSharing: true,
    activityVisibility: 'circles', // public, circles, private
    contactVisibility: 'circles',
    
    // App Preferences
    darkMode: true,
    soundEffects: true,
    hapticFeedback: true,
    autoJoinNearbyCircles: false,
    showAchievementAnimations: true,
    
    // Data & Storage
    offlineMode: false,
    dataSaver: false,
    autoBackup: true,
  });

  const updateSetting = (key: string, value: boolean | string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const showConfirmation = (title: string, message: string, onConfirm: () => void) => {
    if (Platform.OS !== 'web') {
      Alert.alert(title, message, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm', onPress: onConfirm }
      ]);
    } else {
      if (confirm(`${title}\n\n${message}`)) {
        onConfirm();
      }
    }
  };

  const handleSignOut = async () => {
    const signOutMessage = isDemoMode 
      ? 'Are you sure you want to exit demo mode? You can always try it again later.'
      : 'Are you sure you want to sign out of your account? You can always sign back in to continue your civic journey.';

    showConfirmation(
      isDemoMode ? 'Exit Demo Mode' : 'Sign Out',
      signOutMessage,
      async () => {
        try {
          console.log('🚪 Starting sign out process from settings...');
          
          // Perform the sign out
          await signOut();
          
          console.log('✅ Sign out completed, redirecting to landing page...');
          
          // Force redirect to the landing page (sign-in page)
          // Use replace to prevent going back to the authenticated state
          router.replace('/(auth)/sign-in');
          
          console.log('✅ Redirected to sign-in page');
          
        } catch (error) {
          console.error('❌ Sign out error:', error);
          
          // Even if there's an error, try to redirect anyway
          router.replace('/(auth)/sign-in');
          
          if (Platform.OS !== 'web') {
            Alert.alert('Error', 'There was an issue signing out, but you have been redirected to the sign-in page.');
          }
        }
      }
    );
  };

  const handleDeleteAccount = () => {
    if (isDemoMode) {
      Alert.alert(
        'Demo Mode',
        'Account deletion is not available in demo mode. This feature would be available with a real account.',
        [{ text: 'OK' }]
      );
      return;
    }

    showConfirmation(
      'Delete Account',
      'This action cannot be undone. All your data, including civic points, achievements, and community connections will be permanently deleted.',
      () => {
        // In a real app, this would call an API to delete the account
        console.log('Delete account confirmed');
        if (Platform.OS !== 'web') {
          Alert.alert(
            'Account Deletion',
            'Account deletion request has been submitted. You will receive a confirmation email within 24 hours.',
            [{ text: 'OK' }]
          );
        }
      }
    );
  };

  const settingSections: SettingSection[] = [
    {
      title: 'Account',
      items: [
        {
          id: 'profile',
          title: 'Edit Profile',
          description: 'Update your personal information',
          icon: User,
          type: 'navigation',
          onPress: () => console.log('Navigate to profile edit')
        },
        {
          id: 'location',
          title: 'Location Settings',
          description: 'Manage your neighborhood and location preferences',
          icon: MapPin,
          type: 'navigation',
          onPress: () => console.log('Navigate to location settings')
        },
        {
          id: 'contact',
          title: 'Contact Information',
          description: 'Email, phone, and communication preferences',
          icon: Mail,
          type: 'navigation',
          onPress: () => console.log('Navigate to contact settings')
        }
      ]
    },
    {
      title: 'Notifications',
      items: [
        {
          id: 'pushNotifications',
          title: 'Push Notifications',
          description: 'Receive notifications on your device',
          icon: Bell,
          type: 'toggle',
          value: settings.pushNotifications,
          onPress: () => updateSetting('pushNotifications', !settings.pushNotifications)
        },
        {
          id: 'emailNotifications',
          title: 'Email Notifications',
          description: 'Receive updates via email',
          icon: Mail,
          type: 'toggle',
          value: settings.emailNotifications,
          onPress: () => updateSetting('emailNotifications', !settings.emailNotifications)
        },
        {
          id: 'missionReminders',
          title: 'Mission Reminders',
          description: 'Get reminded about upcoming missions',
          icon: Bell,
          type: 'toggle',
          value: settings.missionReminders,
          onPress: () => updateSetting('missionReminders', !settings.missionReminders)
        },
        {
          id: 'circleUpdates',
          title: 'Circle Updates',
          description: 'Notifications from your neighborhood circles',
          icon: Bell,
          type: 'toggle',
          value: settings.circleUpdates,
          onPress: () => updateSetting('circleUpdates', !settings.circleUpdates)
        },
        {
          id: 'achievementAlerts',
          title: 'Achievement Alerts',
          description: 'Celebrate when you unlock achievements',
          icon: Star,
          type: 'toggle',
          value: settings.achievementAlerts,
          onPress: () => updateSetting('achievementAlerts', !settings.achievementAlerts)
        },
        {
          id: 'weeklyDigest',
          title: 'Weekly Digest',
          description: 'Summary of community activity',
          icon: Mail,
          type: 'toggle',
          value: settings.weeklyDigest,
          onPress: () => updateSetting('weeklyDigest', !settings.weeklyDigest)
        }
      ]
    },
    {
      title: 'Privacy & Security',
      items: [
        {
          id: 'profileVisibility',
          title: 'Profile Visibility',
          description: `Currently: ${settings.profileVisibility}`,
          icon: Eye,
          type: 'selection',
          value: settings.profileVisibility,
          options: ['public', 'circles', 'private'],
          onPress: () => console.log('Show profile visibility options')
        },
        {
          id: 'locationSharing',
          title: 'Location Sharing',
          description: 'Share your location with nearby neighbors',
          icon: MapPin,
          type: 'toggle',
          value: settings.locationSharing,
          onPress: () => updateSetting('locationSharing', !settings.locationSharing)
        },
        {
          id: 'activityVisibility',
          title: 'Activity Visibility',
          description: `Who can see your civic activities: ${settings.activityVisibility}`,
          icon: Shield,
          type: 'selection',
          value: settings.activityVisibility,
          options: ['public', 'circles', 'private'],
          onPress: () => console.log('Show activity visibility options')
        },
        {
          id: 'contactVisibility',
          title: 'Contact Visibility',
          description: `Who can see your contact info: ${settings.contactVisibility}`,
          icon: Phone,
          type: 'selection',
          value: settings.contactVisibility,
          options: ['public', 'circles', 'private'],
          onPress: () => console.log('Show contact visibility options')
        },
        {
          id: 'changePassword',
          title: 'Change Password',
          description: isDemoMode ? 'Not available in demo mode' : 'Update your account password',
          icon: Lock,
          type: 'navigation',
          onPress: () => {
            if (isDemoMode) {
              Alert.alert('Demo Mode', 'Password changes are not available in demo mode.');
            } else {
              console.log('Navigate to change password');
            }
          }
        }
      ]
    },
    {
      title: 'App Preferences',
      items: [
        {
          id: 'darkMode',
          title: 'Dark Mode',
          description: 'Use dark theme throughout the app',
          icon: settings.darkMode ? Moon : Sun,
          type: 'toggle',
          value: settings.darkMode,
          onPress: () => updateSetting('darkMode', !settings.darkMode)
        },
        {
          id: 'soundEffects',
          title: 'Sound Effects',
          description: 'Play sounds for interactions and achievements',
          icon: settings.soundEffects ? Volume2 : VolumeX,
          type: 'toggle',
          value: settings.soundEffects,
          onPress: () => updateSetting('soundEffects', !settings.soundEffects)
        },
        {
          id: 'hapticFeedback',
          title: 'Haptic Feedback',
          description: 'Vibration feedback for interactions',
          icon: Phone,
          type: 'toggle',
          value: settings.hapticFeedback,
          onPress: () => updateSetting('hapticFeedback', !settings.hapticFeedback)
        },
        {
          id: 'autoJoinNearbyCircles',
          title: 'Auto-Join Nearby Circles',
          description: 'Automatically join circles in your area',
          icon: Globe,
          type: 'toggle',
          value: settings.autoJoinNearbyCircles,
          onPress: () => updateSetting('autoJoinNearbyCircles', !settings.autoJoinNearbyCircles)
        },
        {
          id: 'showAchievementAnimations',
          title: 'Achievement Animations',
          description: 'Show celebratory animations for achievements',
          icon: Star,
          type: 'toggle',
          value: settings.showAchievementAnimations,
          onPress: () => updateSetting('showAchievementAnimations', !settings.showAchievementAnimations)
        }
      ]
    },
    {
      title: 'Data & Storage',
      items: [
        {
          id: 'offlineMode',
          title: 'Offline Mode',
          description: 'Download content for offline access',
          icon: Download,
          type: 'toggle',
          value: settings.offlineMode,
          onPress: () => updateSetting('offlineMode', !settings.offlineMode)
        },
        {
          id: 'dataSaver',
          title: 'Data Saver Mode',
          description: 'Reduce data usage and image quality',
          icon: Globe,
          type: 'toggle',
          value: settings.dataSaver,
          onPress: () => updateSetting('dataSaver', !settings.dataSaver)
        },
        {
          id: 'autoBackup',
          title: 'Auto Backup',
          description: isDemoMode ? 'Not available in demo mode' : 'Automatically backup your data',
          icon: Upload,
          type: 'toggle',
          value: settings.autoBackup,
          onPress: () => {
            if (isDemoMode) {
              Alert.alert('Demo Mode', 'Auto backup is not available in demo mode.');
            } else {
              updateSetting('autoBackup', !settings.autoBackup);
            }
          }
        },
        {
          id: 'exportData',
          title: 'Export My Data',
          description: isDemoMode ? 'Not available in demo mode' : 'Download a copy of your data',
          icon: Download,
          type: 'action',
          onPress: () => {
            if (isDemoMode) {
              Alert.alert('Demo Mode', 'Data export is not available in demo mode.');
            } else {
              showConfirmation(
                'Export Data',
                'This will create a downloadable file with all your CivicSpark data.',
                () => console.log('Export data')
              );
            }
          }
        },
        {
          id: 'clearCache',
          title: 'Clear Cache',
          description: 'Free up storage space',
          icon: Trash2,
          type: 'action',
          onPress: () => showConfirmation(
            'Clear Cache',
            'This will clear temporary files and may slow down the app temporarily.',
            () => console.log('Clear cache')
          )
        }
      ]
    },
    {
      title: 'Support & Feedback',
      items: [
        {
          id: 'help',
          title: 'Help Center',
          description: 'Get help and find answers',
          icon: HelpCircle,
          type: 'navigation',
          onPress: () => console.log('Navigate to help center')
        },
        {
          id: 'feedback',
          title: 'Send Feedback',
          description: 'Help us improve CivicSpark',
          icon: MessageSquare,
          type: 'navigation',
          onPress: () => console.log('Navigate to feedback form')
        },
        {
          id: 'rate',
          title: 'Rate the App',
          description: 'Leave a review in the app store',
          icon: Star,
          type: 'action',
          onPress: () => console.log('Open app store rating')
        }
      ]
    },
    {
      title: 'Account Actions',
      items: [
        {
          id: 'logout',
          title: isDemoMode ? 'Exit Demo Mode' : 'Sign Out',
          description: isDemoMode ? 'Return to sign-in screen' : 'Sign out of your account',
          icon: LogOut,
          type: 'action',
          destructive: true,
          onPress: handleSignOut
        },
        ...(isDemoMode ? [] : [{
          id: 'deleteAccount',
          title: 'Delete Account',
          description: 'Permanently delete your account and data',
          icon: Trash2,
          type: 'action' as const,
          destructive: true,
          onPress: handleDeleteAccount
        }])
      ]
    }
  ];

  const renderSettingItem = (item: SettingItem) => {
    const IconComponent = item.icon;
    
    return (
      <TouchableOpacity
        key={item.id}
        style={[
          styles.settingItem,
          item.destructive && styles.destructiveItem
        ]}
        onPress={item.onPress}
        disabled={item.type === 'toggle' || (item.id === 'logout' && isLoading)}
      >
        <View style={styles.settingItemLeft}>
          <View style={[
            styles.settingIcon,
            item.destructive && styles.destructiveIcon
          ]}>
            <IconComponent 
              size={20} 
              color={item.destructive ? Colors.error : Colors.primary} 
            />
          </View>
          <View style={styles.settingContent}>
            <Text style={[
              styles.settingTitle,
              item.destructive && styles.destructiveText
            ]}>
              {item.title}
            </Text>
            {item.description && (
              <Text style={styles.settingDescription}>
                {item.description}
              </Text>
            )}
          </View>
        </View>
        
        <View style={styles.settingItemRight}>
          {item.type === 'toggle' && (
            <Switch
              value={item.value as boolean}
              onValueChange={() => item.onPress?.()}
              trackColor={{
                false: Colors.border,
                true: Colors.primary + '40'
              }}
              thumbColor={item.value ? Colors.primary : Colors.textMuted}
            />
          )}
          
          {item.type === 'navigation' && (
            <ChevronRight size={20} color={Colors.textMuted} />
          )}
          
          {item.type === 'selection' && (
            <View style={styles.selectionValue}>
              <Text style={styles.selectionText}>
                {item.value as string}
              </Text>
              <ChevronRight size={16} color={Colors.textMuted} />
            </View>
          )}
          
          {item.type === 'action' && !item.destructive && (
            <ChevronRight size={20} color={Colors.textMuted} />
          )}

          {item.id === 'logout' && isLoading && (
            <View style={styles.loadingIndicator}>
              <Text style={styles.loadingText}>...</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
        <Text style={styles.headerSubtitle}>Customize your CivicSpark experience</Text>
      </View>

      {/* Current User Info */}
      {user && (
        <View style={styles.userInfo}>
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{user.displayName}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
            <Text style={styles.userProvider}>
              {isDemoMode ? (
                <Text style={styles.demoModeIndicator}>🎭 Demo Mode</Text>
              ) : (
                `Signed in with ${user.authProvider === 'email' ? 'Email' : user.authProvider?.charAt(0).toUpperCase() + user.authProvider?.slice(1)}`
              )}
            </Text>
          </View>
        </View>
      )}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {settingSections.map((section, index) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionContent}>
              {section.items.map(renderSettingItem)}
            </View>
          </View>
        ))}

        {/* App Version Info */}
        <View style={styles.versionInfo}>
          <Text style={styles.versionText}>CivicSpark v1.0.0</Text>
          <Text style={styles.versionSubtext}>
            Built with ❤️ for stronger communities
          </Text>
          {isDemoMode && (
            <Text style={styles.demoVersionText}>
              🎭 Demo Mode - Sample data only
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: Colors.backgroundCard,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: Colors.textHeading,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: Colors.textBody,
  },
  userInfo: {
    backgroundColor: Colors.backgroundCard,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  userDetails: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textHeading,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.textBody,
    marginBottom: 2,
  },
  userProvider: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: Colors.textMuted,
  },
  demoModeIndicator: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: Colors.warning,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textHeading,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionContent: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  destructiveIcon: {
    backgroundColor: Colors.error + '20',
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textHeading,
    marginBottom: 2,
  },
  destructiveText: {
    color: Colors.error,
  },
  settingDescription: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: Colors.textBody,
    lineHeight: 18,
  },
  settingItemRight: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectionValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  selectionText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: Colors.textBody,
    textTransform: 'capitalize',
  },
  destructiveItem: {
    borderBottomColor: Colors.error + '20',
  },
  loadingIndicator: {
    paddingHorizontal: 8,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: Colors.textMuted,
  },
  versionInfo: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  versionText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textMuted,
    marginBottom: 4,
  },
  versionSubtext: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: Colors.textMuted,
    textAlign: 'center',
  },
  demoVersionText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: Colors.warning,
    textAlign: 'center',
    marginTop: 4,
  },
});
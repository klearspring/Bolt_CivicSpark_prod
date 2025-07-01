import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MapPin, Settings, CircleAlert as AlertCircle } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { locationService } from '@/services/locationService';
import { LocationPermissionStatus } from '@/types/auth';

interface LocationPermissionGateProps {
  children: React.ReactNode;
  showPermissionUI?: boolean;
}

export default function LocationPermissionGate({ 
  children, 
  showPermissionUI = true 
}: LocationPermissionGateProps) {
  const [permissionStatus, setPermissionStatus] = useState<LocationPermissionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    checkInitialPermissions();
  }, []);

  const checkInitialPermissions = async () => {
    try {
      setIsLoading(true);
      const status = await locationService.checkPermissions();
      setPermissionStatus(status);
    } catch (error) {
      console.error('Error checking location permissions:', error);
      setPermissionStatus({
        granted: false,
        canAskAgain: true,
        status: 'undetermined'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestPermission = async () => {
    try {
      setIsRequesting(true);
      const status = await locationService.requestPermissions();
      setPermissionStatus(status);
    } catch (error) {
      console.error('Error requesting location permissions:', error);
    } finally {
      setIsRequesting(false);
    }
  };

  // If we don't want to show permission UI, just render children
  if (!showPermissionUI) {
    return <>{children}</>;
  }

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Checking location permissions...</Text>
        </View>
      </View>
    );
  }

  // Permission granted - render children
  if (permissionStatus?.granted) {
    return <>{children}</>;
  }

  // Permission denied permanently
  if (permissionStatus?.status === 'denied' && !permissionStatus.canAskAgain) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionContainer}>
          <View style={styles.iconContainer}>
            <AlertCircle size={64} color={Colors.error} />
          </View>
          
          <Text style={styles.title}>Location Access Required</Text>
          <Text style={styles.description}>
            Location permissions have been permanently denied. To enable location features, please:
          </Text>
          
          <View style={styles.instructionsList}>
            <Text style={styles.instructionItem}>1. Open your device Settings</Text>
            <Text style={styles.instructionItem}>2. Find this app in the app list</Text>
            <Text style={styles.instructionItem}>3. Enable Location permissions</Text>
            <Text style={styles.instructionItem}>4. Return to this app</Text>
          </View>

          <TouchableOpacity 
            style={styles.settingsButton}
            onPress={checkInitialPermissions}
          >
            <Settings size={20} color={Colors.white} />
            <Text style={styles.settingsButtonText}>Check Again</Text>
          </TouchableOpacity>

          <Text style={styles.helpText}>
            Location helps us connect you with nearby civic opportunities and neighborhood circles.
          </Text>
        </View>
      </View>
    );
  }

  // Permission not granted but can ask again
  return (
    <View style={styles.container}>
      <View style={styles.permissionContainer}>
        <View style={styles.iconContainer}>
          <MapPin size={64} color={Colors.primary} />
        </View>
        
        <Text style={styles.title}>Enable Location Access</Text>
        <Text style={styles.description}>
          {locationService.getPermissionStatusMessage(permissionStatus!)}
        </Text>
        
        <View style={styles.benefitsList}>
          <Text style={styles.benefitsTitle}>Location helps you:</Text>
          <View style={styles.benefitItem}>
            <Text style={styles.benefitBullet}>•</Text>
            <Text style={styles.benefitText}>Find nearby civic missions and events</Text>
          </View>
          <View style={styles.benefitItem}>
            <Text style={styles.benefitBullet}>•</Text>
            <Text style={styles.benefitText}>Connect with neighborhood circles in your area</Text>
          </View>
          <View style={styles.benefitItem}>
            <Text style={styles.benefitBullet}>•</Text>
            <Text style={styles.benefitText}>Discover local leaders and community initiatives</Text>
          </View>
          <View style={styles.benefitItem}>
            <Text style={styles.benefitBullet}>•</Text>
            <Text style={styles.benefitText}>Get personalized civic engagement opportunities</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.permissionButton, isRequesting && styles.permissionButtonDisabled]}
          onPress={handleRequestPermission}
          disabled={isRequesting}
        >
          {isRequesting ? (
            <ActivityIndicator size={20} color={Colors.white} />
          ) : (
            <MapPin size={20} color={Colors.white} />
          )}
          <Text style={styles.permissionButtonText}>
            {isRequesting ? 'Requesting...' : 'Enable Location Access'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.skipButton}
          onPress={() => setPermissionStatus({ granted: true, canAskAgain: false, status: 'granted' })}
        >
          <Text style={styles.skipButtonText}>Skip for now</Text>
        </TouchableOpacity>

        <Text style={styles.privacyNote}>
          Your location data is kept private and secure. You can change these settings anytime.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: Colors.textBody,
  },
  permissionContainer: {
    maxWidth: 400,
    width: '100%',
    alignItems: 'center',
    paddingVertical: 40,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    borderWidth: 2,
    borderColor: Colors.primary + '40',
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: Colors.textHeading,
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: Colors.textBody,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  benefitsList: {
    width: '100%',
    marginBottom: 32,
  },
  benefitsTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textHeading,
    marginBottom: 16,
    textAlign: 'center',
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  benefitBullet: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: Colors.primary,
    marginRight: 12,
    width: 16,
  },
  benefitText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.textBody,
    lineHeight: 20,
    flex: 1,
  },
  instructionsList: {
    width: '100%',
    backgroundColor: Colors.backgroundCard,
    borderRadius: 12,
    padding: 20,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  instructionItem: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.textBody,
    lineHeight: 20,
    marginBottom: 8,
  },
  permissionButton: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    minWidth: 200,
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  permissionButtonDisabled: {
    opacity: 0.6,
  },
  permissionButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: Colors.white,
    marginLeft: 8,
  },
  settingsButton: {
    flexDirection: 'row',
    backgroundColor: Colors.error,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    minWidth: 200,
  },
  settingsButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: Colors.white,
    marginLeft: 8,
  },
  skipButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  skipButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textMuted,
  },
  privacyNote: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 16,
    maxWidth: 300,
  },
  helpText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.textBody,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 16,
  },
});
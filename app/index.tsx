import { useEffect } from 'react';
import { router } from 'expo-router';
import { View, StyleSheet, Text } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { Colors } from '@/constants/Colors';

export default function IndexScreen() {
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      // ALWAYS redirect to sign-in page as the default entry point
      // This ensures every visit starts with the sign-in page
      if (isAuthenticated) {
        // If user is already authenticated, go directly to the app
        router.replace('/(tabs)');
      } else {
        // Always show sign-in page as the landing page
        // This is the default entry point for all users
        router.replace('/(auth)/sign-in');
      }
    }
  }, [isAuthenticated, isLoading]);

  // Show loading screen while checking auth state
  return (
    <View style={styles.container}>
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>CivicSpark</Text>
        <Text style={styles.loadingSubtext}>Loading...</Text>
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
  },
  loadingContainer: {
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: Colors.primary,
    marginBottom: 8,
  },
  loadingSubtext: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: Colors.textBody,
  },
});
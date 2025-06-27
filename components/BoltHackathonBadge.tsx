import React from 'react';
import { View, StyleSheet, TouchableOpacity, Linking, Platform, Text } from 'react-native';

interface BoltHackathonBadgeProps {
  width?: number;
  height?: number;
  style?: any;
}

export default function BoltHackathonBadge({ 
  width = 120, 
  height = 120, 
  style 
}: BoltHackathonBadgeProps) {
  
  const handlePress = async () => {
    const url = 'https://bolt.new/';
    
    try {
      if (Platform.OS === 'web') {
        // For web, open in new tab
        window.open(url, '_blank');
      } else {
        // For mobile, use Linking
        const supported = await Linking.canOpenURL(url);
        if (supported) {
          await Linking.openURL(url);
        }
      }
    } catch (error) {
      console.error('Error opening Bolt.new:', error);
    }
  };

  // Calculate the size for the circular badge
  const badgeSize = Math.min(width, height);

  return (
    <TouchableOpacity 
      style={[styles.container, style]} 
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={[
        styles.boltBadge,
        {
          width: badgeSize,
          height: badgeSize,
          borderRadius: badgeSize / 2,
        }
      ]}>
        {/* Circular text around the edge */}
        <View style={styles.circularTextContainer}>
          <Text style={[styles.circularText, { fontSize: badgeSize * 0.08 }]}>
            POWERED BY BOLT.NEW MADE IN
          </Text>
        </View>
        
        {/* Central 'b' logo */}
        <View style={styles.centralLogo}>
          <Text style={[styles.logoText, { fontSize: badgeSize * 0.4 }]}>b</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  boltBadge: {
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    position: 'relative',
  },
  circularTextContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circularText: {
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
    fontWeight: '900',
    letterSpacing: 2,
    textAlign: 'center',
    position: 'absolute',
    top: '15%',
    left: 0,
    right: 0,
    transform: [{ rotate: '0deg' }],
  },
  centralLogo: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  logoText: {
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
    fontWeight: '900',
    textAlign: 'center',
  },
});
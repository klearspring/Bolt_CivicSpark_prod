import React from 'react';
import { View, StyleSheet, TouchableOpacity, Linking, Platform } from 'react-native';

interface BoltHackathonBadgeProps {
  width?: number;
  height?: number;
  style?: any;
}

export default function BoltHackathonBadge({ 
  width = 200, 
  height = 60, 
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

  // Calculate the size for the circular badge to maintain aspect ratio
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
        }
      ]}>
        <View style={styles.boltIcon}>
          <View style={styles.lightning}>
            <View style={styles.lightningTop} />
            <View style={styles.lightningBottom} />
          </View>
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
    borderRadius: 999,
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
  },
  boltIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  lightning: {
    position: 'relative',
    width: 24,
    height: 32,
  },
  lightningTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 16,
    borderBottomWidth: 18,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#A9F00F',
  },
  lightningBottom: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 0,
    height: 0,
    borderLeftWidth: 16,
    borderRightWidth: 8,
    borderTopWidth: 18,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#A9F00F',
  },
});
import React from 'react';
import { View, StyleSheet, TouchableOpacity, Linking, Platform } from 'react-native';
import { SvgUri } from 'react-native-svg';

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

  // Calculate the size for the circular badge to maintain aspect ratio
  const badgeSize = Math.min(width, height);

  return (
    <TouchableOpacity 
      style={[styles.container, style]} 
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <SvgUri
        width={badgeSize}
        height={badgeSize}
        uri="/assets/images/bolt-badge.svg"
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
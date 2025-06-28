import React from 'react';
import { View, StyleSheet, TouchableOpacity, Linking, Platform, Image } from 'react-native';

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

  return (
    <TouchableOpacity 
      style={[styles.container, style]} 
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <Image
        source={require('@/assets/images/black_circle_360x360.svg')}
        style={{
          width,
          height,
          borderRadius: width / 2, // Make it perfectly circular
        }}
        resizeMode="contain"
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  }
});
import React from 'react';
import { View, StyleSheet, TouchableOpacity, Linking, Platform } from 'react-native';
import { SvgXml } from 'react-native-svg';

interface BoltHackathonBadgeProps {
  width?: number;
  height?: number;
  style?: any;
}

// Import the SVG as a string
const boltBadgeSvg = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0.00 0.00 360.00 360.00">
<circle cx="180" cy="180" r="180" fill="#000000"/>
</svg>`;

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
      <SvgXml 
        xml={boltBadgeSvg} 
        width={badgeSize} 
        height={badgeSize} 
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
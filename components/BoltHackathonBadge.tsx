import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Rect, Text as SvgText, Defs, LinearGradient, Stop } from 'react-native-svg';

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
  return (
    <View style={[styles.container, style]}>
      <Svg width={width} height={height} viewBox="0 0 200 60">
        <Defs>
          <LinearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#FF6B35" stopOpacity="1" />
            <Stop offset="100%" stopColor="#F7931E" stopOpacity="1" />
          </LinearGradient>
        </Defs>
        
        {/* Background */}
        <Rect
          x="2"
          y="2"
          width="196"
          height="56"
          rx="8"
          ry="8"
          fill="url(#grad)"
          stroke="#FF6B35"
          strokeWidth="2"
        />
        
        {/* Text */}
        <SvgText
          x="100"
          y="25"
          textAnchor="middle"
          fontSize="12"
          fontWeight="bold"
          fill="white"
        >
          BUILT WITH
        </SvgText>
        
        <SvgText
          x="100"
          y="42"
          textAnchor="middle"
          fontSize="16"
          fontWeight="bold"
          fill="white"
        >
          ⚡ BOLT
        </SvgText>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
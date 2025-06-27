// Color system for CivicSpark
// Primary: #A9F00F (Bright Green)
// Secondary: #547808, #81B61C, #111A23
// Text: #F0F4F1 (Headings), #D7E5D8 (Body)
// Background: #152025

export const Colors = {
  // Primary Colors
  primary: '#A9F00F',
  primaryDark: '#81B61C',
  primaryLight: '#C4FF3D',
  
  // Secondary Colors
  secondary: '#547808',
  secondaryLight: '#81B61C',
  secondaryDark: '#111A23',
  
  // Background Colors
  background: '#152025',
  backgroundLight: '#1E2A30',
  backgroundCard: '#243138',
  backgroundModal: '#2A3A42',
  
  // Text Colors
  textHeading: '#F0F4F1',
  textBody: '#D7E5D8',
  textMuted: '#9BB0A1',
  textDisabled: '#6B7B72',
  
  // Status Colors (adjusted for dark theme)
  success: '#A9F00F',
  successDark: '#81B61C',
  warning: '#FFB800',
  warningDark: '#E6A500',
  error: '#FF4444',
  errorDark: '#CC3333',
  info: '#00B4D8',
  infoDark: '#0096C7',
  
  // Interactive Colors
  link: '#A9F00F',
  linkHover: '#C4FF3D',
  
  // Border Colors
  border: '#3A4A52',
  borderLight: '#4A5A62',
  borderFocus: '#A9F00F',
  
  // Category Colors (updated for dark theme)
  category: {
    community: '#FF6B35',
    government: '#00B4D8',
    environment: '#A9F00F',
    education: '#8E44AD',
    housing: '#E67E22',
    safety: '#E74C3C',
    general: '#95A5A6',
    schools: '#9B59B6',
  },
  
  // Achievement Rarity Colors
  rarity: {
    common: '#95A5A6',
    rare: '#3498DB',
    epic: '#9B59B6',
    legendary: '#F39C12',
  },
  
  // Recipient Type Colors
  recipient: {
    everyone: '#00B4D8',
    circle: '#A9F00F',
    person: '#FF6B35',
  },
  
  // White/Black for specific use cases
  white: '#FFFFFF',
  black: '#000000',
  
  // Transparent variants
  transparent: 'transparent',
  overlay: 'rgba(21, 32, 37, 0.8)',
  overlayLight: 'rgba(21, 32, 37, 0.6)',
};

// Helper function to get color with opacity
export const withOpacity = (color: string, opacity: number): string => {
  // Convert hex to rgba
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

// Accessibility helpers
export const getContrastColor = (backgroundColor: string): string => {
  // Simple contrast calculation - returns appropriate text color
  const darkBackgrounds = [
    Colors.background,
    Colors.backgroundLight,
    Colors.backgroundCard,
    Colors.backgroundModal,
    Colors.secondaryDark,
  ];
  
  if (darkBackgrounds.includes(backgroundColor)) {
    return Colors.textHeading;
  }
  
  return Colors.secondaryDark;
};
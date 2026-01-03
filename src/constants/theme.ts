export const theme = {
  colors: {
    primary: '#7B2FFE', // Purple (Brand Color)
    secondary: '#A3FF00', // Neon green (Accents)
    background: '#0A0A14', // Deep dark background
    surface: '#1E1E2D', // Slightly lighter dark for cards
    cardBackground: '#FFFFFF', // White cards
    text: '#FFFFFF',
    textDark: '#1A1A2E', // Dark text for light backgrounds
    textSecondary: '#CDCDE0', // Lighter gray for secondary text
    error: '#FF3333',
    success: '#4CAF50',
    warning: '#FFC107',
    border: '#7B2FFE',
    gradient: {
      start: '#7B2FFE',
      middle: '#6B00D6',
      end: '#0A0A14',
    },
    tag: {
      background: '#E8E8F0',
      text: '#1A1A2E',
    },
  },
  fonts: {
    regular: 'System',
    bold: 'System',
    sizes: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 24,
      xxl: 32,
      xxxl: 48,
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    full: 9999,
  },
  shadows: {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 8,
    },
  },
};

export const images = {
  logo: require('../../assets/logo.png'),
  logoWithBg: require('../../assets/logo-with-bg.png'),
  background: require('../../assets/fond.png'),
};

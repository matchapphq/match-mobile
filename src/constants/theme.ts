import { COLORS } from "./colors";

export const theme = {
  colors: {
    ...COLORS,
    primary: COLORS.primary,
    secondary: COLORS.sky400,
    background: COLORS.background,
    surface: COLORS.surface,
    cardBackground: COLORS.surfaceLight,
    text: COLORS.text,
    textDark: COLORS.textInverse,
    textSecondary: COLORS.textSecondary,
    error: COLORS.red400,
    success: COLORS.emerald500,
    warning: COLORS.yellow400,
    border: COLORS.border,
    gradient: {
      start: COLORS.primary,
      middle: COLORS.primaryDark,
      end: COLORS.background,
    },
    tag: {
      background: COLORS.surfaceLight,
      text: COLORS.textInverse,
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

/**
 * Enhanced Theme Configuration
 * Includes colors, typography, spacing, shadows, and more
 */






export const colors = {
  // Primary Brand Colors

  background: '#F7F2E9',
  patternGold: '#C5A059',
  primaryTeal: '#008080',
  textMain: '#2D2926',
  white: '#FFFFFF',



  primary: "#006D6F",        // Teal - Main brand color
  primaryLight: "#1A9FA1",   // Lighter teal for hover states
  primaryDark: "#004D4F",    // Darker teal for active states
  
  // Secondary Colors
  secondary: "#C37D4E",      // Warm terracotta
  secondaryLight: "#E8A680", // Light terracotta
  secondaryDark: "#8B5A34",  // Dark terracotta
  
  // Neutral Colors (improved)
  white: "#FFFFFF",
  black: "#000000",
  dark: "#0C0C0C",           // Very dark gray (near black)
  darkGray: "#2C2C2C",       // Dark gray
  mediumGray: "#666666",     // Medium gray
  lightGray: "#E5E5E5",      // Light gray
  lighterGray: "#F5F5F5",    // Very light gray
  background: "#F9F4EF",     // Light beige background
  surface: "#FFFFFF",        // Surface/card background
  
  // Text Colors (improved contrast)
  textPrimary: "#1A1A1A",    // Main text - dark
  textSecondary: "#666666",  // Secondary text - medium gray
  textTertiary: "#999999",   // Tertiary text - lighter gray
  textInverse: "#FFFFFF",    // Text on dark backgrounds
  
  // Semantic Colors
  success: "#4BB543",        // Green - Success state
  successLight: "#A8E6A3",   // Light green
  danger: "#FF5252",         // Red - Error/Danger state
  dangerLight: "#FFCDD2",    // Light red
  warning: "#FFC107",        // Yellow - Warning state
  warningLight: "#FFF9C4",   // Light yellow
  info: "#2196F3",           // Blue - Info state
  infoLight: "#BBDEFB",      // Light blue
  
  // Special Colors
  accent: "#FC5C65",         // Orange accent for CTAs
  accentDark: "#E23E3E",     // Dark accent
  gold: "#D4AF37",           // Gold for premium features
  
  // Shadows
  shadowColor: "#00000015",  // Light shadow
  shadowColorStrong: "#00000025", // Strong shadow
};

export const typography = {
  // Font Sizes
  fontSize: {
    xs: 10,
    sm: 12,
    base: 14,
    lg: 16,
    xl: 18,
    "2xl": 20,
    "3xl": 24,
    "4xl": 28,
    "5xl": 32,
  },
  
  // Font Weights
  fontWeight: {
    thin: "100",
    extralight: "200",
    light: "300",
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
    extrabold: "800",
    black: "900",
  },
  
  // Line Heights
  lineHeight: {
    tight: 1.1,
    normal: 1.5,
    relaxed: 1.75,
    loose: 2,
  },
};

export const spacing = {
  // Spacing scale (in pixels)
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 40,
  "5xl": 48,
};

export const borderRadius = {
  none: 0,
  xs: 4,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  "2xl": 20,
  "3xl": 24,
  full: 9999,
};

export const shadows = {
  none: {
    shadowColor: "#00000000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  xs: {
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  xl: {
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 12,
  },
};

export const elevation = {
  // Material Design elevation system
  0: shadows.none,
  1: shadows.xs,
  2: shadows.sm,
  4: shadows.md,
  8: shadows.lg,
  12: shadows.xl,
};

export default {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  elevation,
};

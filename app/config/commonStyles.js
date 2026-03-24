/**
 * Common StyleSheet Presets
 * Use these as starting points for component styles
 */

import { StyleSheet } from "react-native";
import theme from "./theme";

export const commonStyles = StyleSheet.create({
  // Flexbox utilities
  row: {
    flexDirection: "row",
  },
  rowCenter: {
    flexDirection: "row",
    alignItems: "center",
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  flex1: {
    flex: 1,
  },
  
  // Container styles
  container: {
    padding: theme.spacing.lg,
  },
  containerPadded: {
    padding: theme.spacing.xl,
  },
  containerCompact: {
    padding: theme.spacing.md,
  },
  
  // Card/Surface styles
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    ...theme.shadows.md,
  },
  cardCompact: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    ...theme.shadows.sm,
  },
  
  // Text styles
  textSmall: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  textMedium: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textPrimary,
  },
  textLarge: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.textPrimary,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  
  // Divider styles
  divider: {
    height: 1,
    backgroundColor: theme.colors.lightGray,
    marginVertical: theme.spacing.md,
  },
  dividerHeavy: {
    height: 2,
    backgroundColor: theme.colors.lightGray,
    marginVertical: theme.spacing.lg,
  },
  
  // Badge styles
  badge: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary,
  },
  badgeSmall: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    fontSize: theme.typography.fontSize.xs,
  },
  
  // Overlay styles
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  overlayLight: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  
  // Border styles
  border: {
    borderWidth: 1,
    borderColor: theme.colors.lightGray,
  },
  borderPrimary: {
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  borderRounded: {
    borderWidth: 1,
    borderColor: theme.colors.lightGray,
    borderRadius: theme.borderRadius.lg,
  },
  
  // Shadow utilities (alternative to theme.shadows)
  shadowSmall: theme.shadows.sm,
  shadowMedium: theme.shadows.md,
  shadowLarge: theme.shadows.lg,
});

export default commonStyles;

import React from "react";
import { Text as RNText } from "react-native";
import theme from "../config/theme";

/**
 * Custom Text component with predefined typography styles
 * @param {string} variant - 'h1', 'h2', 'h3', 'h4', 'body', 'caption', 'overline'
 * @param {string} color - text color key from theme or hex color
 * @param {object} style - additional custom styles
 */
function AppText({ 
  variant = "body", 
  color = "black", 
  children, 
  style,
  ...props 
}) {
  const toLineHeight = (fontSize, lineHeightMultiplier) =>
    Math.round(fontSize * lineHeightMultiplier);

  const variantStyles = {
    h1: {
      fontSize: theme.typography.fontSize["5xl"],
      fontWeight: theme.typography.fontWeight.bold,
      lineHeight: toLineHeight(
        theme.typography.fontSize["5xl"],
        theme.typography.lineHeight.tight
      ),
    },
    h2: {
      fontSize: theme.typography.fontSize["4xl"],
      fontWeight: theme.typography.fontWeight.bold,
      lineHeight: toLineHeight(
        theme.typography.fontSize["4xl"],
        theme.typography.lineHeight.tight
      ),
    },
    h3: {
      fontSize: theme.typography.fontSize["3xl"],
      fontWeight: theme.typography.fontWeight.semibold,
      lineHeight: toLineHeight(
        theme.typography.fontSize["3xl"],
        theme.typography.lineHeight.normal
      ),
    },
    h4: {
      fontSize: theme.typography.fontSize["2xl"],
      fontWeight: theme.typography.fontWeight.semibold,
      lineHeight: toLineHeight(
        theme.typography.fontSize["2xl"],
        theme.typography.lineHeight.normal
      ),
    },
    body: {
      fontSize: theme.typography.fontSize.base,
      fontWeight: theme.typography.fontWeight.normal,
      lineHeight: toLineHeight(
        theme.typography.fontSize.base,
        theme.typography.lineHeight.relaxed
      ),
    },
    bodyLarge: {
      fontSize: theme.typography.fontSize.lg,
      fontWeight: theme.typography.fontWeight.normal,
      lineHeight: toLineHeight(
        theme.typography.fontSize.lg,
        theme.typography.lineHeight.relaxed
      ),
    },
    bodySmall: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.normal,
      lineHeight: toLineHeight(
        theme.typography.fontSize.sm,
        theme.typography.lineHeight.normal
      ),
    },
    caption: {
      fontSize: theme.typography.fontSize.xs,
      fontWeight: theme.typography.fontWeight.normal,
      lineHeight: toLineHeight(
        theme.typography.fontSize.xs,
        theme.typography.lineHeight.tight
      ),
    },
    overline: {
      fontSize: theme.typography.fontSize.xs,
      fontWeight: theme.typography.fontWeight.semibold,
      lineHeight: toLineHeight(
        theme.typography.fontSize.xs,
        theme.typography.lineHeight.tight
      ),
      textTransform: "uppercase",
      letterSpacing: 1,
    },
  };

  return (
    <RNText
      style={[
        variantStyles[variant],
        { color: theme.colors[color] || color },
        style,
      ]}
      {...props}
    >
      {children}
    </RNText>
  );
}

export default AppText;

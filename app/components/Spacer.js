import React from "react";
import { StyleSheet, View } from "react-native";
import theme from "../config/theme";

/**
 * Spacer component for consistent spacing throughout the app
 * @param {number} size - spacing multiplier ('xs', 'sm', 'md', 'lg', 'xl', etc.)
 * @param {string} direction - 'vertical' or 'horizontal'
 */
function Spacer({ size = "md", direction = "vertical" }) {
  const spacingValue = theme.spacing[size] || theme.spacing.md;
  
  const style = direction === "vertical"
    ? { height: spacingValue }
    : { width: spacingValue };

  return <View style={style} />;
}

export default Spacer;

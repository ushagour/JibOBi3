import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, ActivityIndicator, View } from "react-native";
import theme from "../config/theme";

function AppButton({ 
  title, 
  onPress, 
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  icon = null,
  fullWidth = true,
  compact = false,
  inline = false,
}) {
  const [isPressed, setIsPressed] = useState(false);

  const variantStyles = {
    primary: {
      backgroundColor: isPressed ? theme.colors.primaryDark : theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    secondary: {
      backgroundColor: isPressed ? theme.colors.secondaryDark : theme.colors.secondary,
      borderColor: theme.colors.secondary,
    },
    outline: {
      backgroundColor: "transparent",
      borderColor: theme.colors.primary,
      borderWidth: 2,
    },
    ghost: {
      backgroundColor: "transparent",
      borderColor: "transparent",
    },
    danger: {
      backgroundColor: isPressed ? "#D32F2F" : theme.colors.danger,
      borderColor: theme.colors.danger,
    },
    success: {
      backgroundColor: isPressed ? "#3D9437" : theme.colors.success,
      borderColor: theme.colors.success,
    },
  };

  const sizeStyles = {
    sm: {
      paddingVertical: 8,
      paddingHorizontal: 12,
    },
    md: {
      paddingVertical: 12,
      paddingHorizontal: 16,
    },
    lg: {
      paddingVertical: 16,
      paddingHorizontal: 20,
    },
  };

  const compactSizeStyles = {
    sm: {
      paddingVertical: 6,
      paddingHorizontal: 10,
    },
    md: {
      paddingVertical: 8,
      paddingHorizontal: 12,
    },
    lg: {
      paddingVertical: 10,
      paddingHorizontal: 14,
    },
  };

  const textColorMap = {
    primary: theme.colors.white,
    secondary: theme.colors.white,
    outline: theme.colors.primary,
    ghost: theme.colors.primary,
    danger: theme.colors.white,
    success: theme.colors.white,
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        variantStyles[variant],
        compact ? compactSizeStyles[size] : sizeStyles[size],
        inline && styles.inline,
        fullWidth && { width: "100%" },
        disabled && styles.disabled,
        { ...theme.shadows.md },
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      onPressIn={() => !disabled && setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      activeOpacity={0.8}
    >
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator color={textColorMap[variant]} size="small" />
        ) : (
          <>
            {icon && <View style={styles.icon}>{icon}</View>}
            <Text style={[styles.text, { color: textColorMap[variant] }]}>
              {title}
            </Text>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: theme.borderRadius.lg,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: theme.spacing.md,
  },
  inline: {
    flex: 1,
    marginVertical: 0,
  },
  content: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  icon: {
    marginRight: theme.spacing.sm,
  },
  text: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    textTransform: "capitalize",
  },
  disabled: {
    opacity: 0.5,
  },
});

export default AppButton;

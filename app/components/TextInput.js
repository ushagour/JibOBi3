import React, { useState } from "react";
import {
  View,
  TextInput as RNTextInput,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import theme from "../config/theme";
import AppText from "./Text";

function AppTextInput({
  icon,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  error = null,
  label = null,
  disabled = false,
  placeholderTextColor = theme.colors.textTertiary,
  ...otherProps
}) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={styles.container}>
      {label && (
        <AppText
          variant="overline"
          color="textSecondary"
          style={styles.label}
        >
          {label}
        </AppText>
      )}
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputFocused,
          error && styles.inputError,
          disabled && styles.inputDisabled,
        ]}
      >
        {icon && (
          <MaterialCommunityIcons
            name={icon}
            size={20}
            color={isFocused ? theme.colors.primary : theme.colors.textTertiary}
            style={styles.icon}
          />
        )}
        <RNTextInput
          placeholder={placeholder}
          placeholderTextColor={placeholderTextColor}
          style={[styles.input, { paddingLeft: icon ? 12 : 16 }]}
          secureTextEntry={secureTextEntry && !showPassword}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          editable={!disabled}
          {...otherProps}
        />
        {secureTextEntry && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.toggleIcon}
          >
            <MaterialCommunityIcons
              name={showPassword ? "eye" : "eye-off"}
              size={20}
              color={theme.colors.textTertiary}
            />
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <AppText variant="caption" color="danger" style={styles.errorText}>
          {error}
        </AppText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: theme.spacing.md,
  },
  label: {
    marginBottom: theme.spacing.sm,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.lighterGray,
    borderWidth: 2,
    borderColor: "transparent",
    paddingHorizontal: theme.spacing.md,
    height: 50,
    ...theme.shadows.xs,
  },
  inputFocused: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.white,
  },
  inputError: {
    borderColor: theme.colors.danger,
  },
  inputDisabled: {
    backgroundColor: theme.colors.lightGray,
    opacity: 0.6,
  },
  icon: {
    marginRight: theme.spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textPrimary,
    padding: 0,
  },
  toggleIcon: {
    padding: theme.spacing.sm,
  },
  errorText: {
    marginTop: theme.spacing.xs,
  },
});

export default AppTextInput;

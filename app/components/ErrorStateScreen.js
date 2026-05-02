import React from "react";
import { StyleSheet, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import Screen from "./Screen";
import AppText from "./Text";
import AppButton from "./Button";
import theme from "../config/theme";

const CASES = {
  network: {
    icon: "wifi-alert",
    iconBg: theme.colors.warningLight,
    iconColor: theme.colors.warning,
    title: "No internet connection",
    message: "Please check your connection and try again.",
  },
  server: {
    icon: "server-network-off",
    iconBg: theme.colors.dangerLight,
    iconColor: theme.colors.danger,
    title: "Server error",
    message: "Something went wrong on our side. Please try again soon.",
  },
  notFound: {
    icon: "file-search-outline",
    iconBg: theme.colors.infoLight,
    iconColor: theme.colors.info,
    title: "Content not found",
    message: "The item may have been removed or is no longer available.",
  },
  permission: {
    icon: "lock-alert-outline",
    iconBg: theme.colors.warningLight,
    iconColor: theme.colors.warning,
    title: "Permission required",
    message: "You do not have permission to access this content.",
  },
  generic: {
    icon: "alert-circle-outline",
    iconBg: theme.colors.dangerLight,
    iconColor: theme.colors.danger,
    title: "Something went wrong",
    message: "An unexpected issue happened. Please try again.",
  },
};

function ErrorStateScreen({
  type = "generic",
  title,
  message,
  details,
  onRetry,
  onGoBack,
  retryLabel = "Try again",
  backLabel = "Go back",
  backVariant = "outline",
  backSize = "md",
}) {
  const config = CASES[type] || CASES.generic;
  const isDevelopment = __DEV__;
  const resolvedTitle = isDevelopment ? (title || config.title) : config.title;
  const resolvedMessage = isDevelopment ? (message || config.message) : config.message;

  return (
    <Screen style={styles.screen} scrollable={false}>
      <View style={styles.card}>
        <View style={[styles.iconWrap, { backgroundColor: config.iconBg }]}>
          <MaterialCommunityIcons
            name={config.icon}
            size={42}
            color={config.iconColor}
          />
        </View>

        <AppText variant="h4" color="textPrimary" style={styles.title}>
          {resolvedTitle}
        </AppText>

        <AppText color="textSecondary" style={styles.message}>
          {resolvedMessage}
        </AppText>

        {isDevelopment && !!details && (
          <AppText variant="bodySmall" color="textTertiary" style={styles.details}>
            {details}
          </AppText>
        )}

        <View style={styles.actions}>
          {!!onRetry && (
            <AppButton
              title={retryLabel}
              onPress={onRetry}
              variant="primary"
              size="md"
            />
          )}

          {!!onGoBack && (
            <AppButton
              title={backLabel}
              onPress={onGoBack}
              variant={backVariant}
              size={backSize}
            />
          )}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.background,
  },
  card: {
    width: "100%",
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing["3xl"],
    alignItems: "center",
    ...theme.shadows.lg,
  },
  iconWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.lg,
  },
  title: {
    textAlign: "center",
    marginBottom: theme.spacing.sm,
  },
  message: {
    textAlign: "center",
  },
  details: {
    textAlign: "center",
    marginTop: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
  },
  actions: {
    width: "100%",
    marginTop: theme.spacing.lg,
  },
});

export default ErrorStateScreen;

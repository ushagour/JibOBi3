import React from "react";
import { StyleSheet, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

import Screen from "./Screen";
import AppText from "./Text";
import AppButton from "./Button";
import theme from "../config/theme";

// Error type configuration
const getErrorConfig = (type) => ({
  network: {
    icon: "wifi-alert",
    iconBg: theme.colors.warningLight,
    iconColor: theme.colors.warning,
    titleKey: "error_states.no_internet",
    messageKey: "error_states.no_internet_message",
  },
  server: {
    icon: "server-network-off",
    iconBg: theme.colors.dangerLight,
    iconColor: theme.colors.danger,
    titleKey: "error_states.server_error",
    messageKey: "error_states.server_error_message",
  },
  notFound: {
    icon: "file-search-outline",
    iconBg: theme.colors.infoLight,
    iconColor: theme.colors.info,
    titleKey: "error_states.not_found",
    messageKey: "error_states.not_found_message",
  },
  permission: {
    icon: "lock-alert-outline",
    iconBg: theme.colors.warningLight,
    iconColor: theme.colors.warning,
    titleKey: "error_states.permission",
    messageKey: "error_states.permission_message",
  },
  generic: {
    icon: "alert-circle-outline",
    iconBg: theme.colors.dangerLight,
    iconColor: theme.colors.danger,
    titleKey: "error_states.generic",
    messageKey: "error_states.generic_message",
  },
})[type] || ({
  icon: "alert-circle-outline",
  iconBg: theme.colors.dangerLight,
  iconColor: theme.colors.danger,
  titleKey: "error_states.generic",
  messageKey: "error_states.generic_message",
});

function ErrorStateScreen({
  type = "generic",
  title,
  message,
  details,
  onRetry,
  onGoBack,
  retryLabel,
  backLabel,
  backVariant = "outline",
  backSize = "md",
}) {
  const { t } = useTranslation();
  const config = getErrorConfig(type);
  const displayTitle = title || t(config.titleKey);
  const displayMessage = message || t(config.messageKey);
  const displayRetryLabel = retryLabel || t('common.try_again');
  const displayBackLabel = backLabel || t('common.go_back');
  const isDevelopment = __DEV__;
  const resolvedTitle = isDevelopment ? (title || displayTitle) : displayTitle;
  const resolvedMessage = isDevelopment ? (message || displayMessage) : displayMessage;

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
              title={displayRetryLabel}
              onPress={onRetry}
              variant="primary"
              size="md"
            />
          )}

          {!!onGoBack && (
            <AppButton
              title={displayBackLabel}
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

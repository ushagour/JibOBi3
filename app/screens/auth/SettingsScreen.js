import React, { useState } from "react";
import { StyleSheet, View, Switch, Alert } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import Screen from "../../components/Screen";
import Text from "../../components/Text";
import LanguageSwitcher from "../../components/LanguageSwitcher";
import colors from "../../config/colors";
import useTheme from "../../hooks/useTheme";
import AwesomeAlert from "react-native-awesome-alerts";
import { useTranslation } from "react-i18next";

function SettingRow({ icon, title, subTitle }) {
  return (
    <View style={styles.row}>
      <View style={styles.iconWrap}>
        <MaterialCommunityIcons name={icon} size={18} color={colors.primary} />
      </View>
      <View style={styles.textWrap}>
        <Text style={styles.rowTitle}>{title}</Text>
        {subTitle ? <Text style={styles.rowSubTitle}>{subTitle}</Text> : null}
      </View>
    </View>
  );
}

function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const { colors: themeColors, isDark } = useTheme();
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState({
    pushEnabled: true,
    messageNotifications: true,
    reviewNotifications: true,
    orderNotifications: true,
    marketingEmails: false,
  });
  const [sweetAlert, setSweetAlert] = useState({
    show: false,
    title: "",
    message: "",
    type: "info",
    showCancel: false,
    onConfirm: null,
  });

  const closeSweetAlert = () => {
    setSweetAlert((prev) => ({
      ...prev,
      show: false,
      onConfirm: null,
      showCancel: false,
    }));
  };

  const toggleNotification = (key) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleDarkModeToggle = async () => {
    try {
      setDarkMode(!darkMode);
      // TODO: Persist dark mode preference to AsyncStorage or API
      showSweetAlert({
        title: darkMode ? "☀️ Light Mode Enabled" : "🌙 Dark Mode Enabled",
        message: `Theme preference has been updated.`,
        type: "success",
      });
    } catch (err) {
      console.error("Error toggling dark mode:", err);
    }
  };

  const showSweetAlert = ({
    title,
    message,
    type = "info",
    showCancel = false,
    onConfirm = null,
  }) => {
    setSweetAlert({
      show: true,
      title,
      message,
      type,
      showCancel,
      onConfirm,
    });
  };

  return (
    <>
      <Screen
        key={String(i18n.resolvedLanguage || i18n.language || "en")}
        style={styles.screen}
        paddingSize="lg"
      >
        <Text style={styles.subtitle}>{t("settings.manage_preferences")}</Text>

        {/* Dark Mode Toggle */}
        <View style={[styles.card, { backgroundColor: themeColors.surface }]}>
          <View style={styles.row}>
            <View style={styles.iconWrap}>
              <MaterialCommunityIcons name="brightness-4" size={18} color={colors.primary} />
            </View>
            <View style={styles.textWrap}>
              <Text style={styles.rowTitle}>{t("settings.dark_mode")}</Text>
              <Text style={styles.rowSubTitle}>{t("settings.dark_mode_subtitle")}</Text>
            </View>
            <Switch
              value={darkMode}
              onValueChange={handleDarkModeToggle}
              trackColor={{ false: colors.lightGray, true: colors.primary }}
              thumbColor={darkMode ? colors.primary : colors.white}
            />
          </View>
        </View>

        {/* Language Toggle */}
        <View style={[styles.card, styles.cardSpacing, { backgroundColor: themeColors.surface }]}>
          <View style={styles.row}>
            <View style={styles.iconWrap}>
              <MaterialCommunityIcons name="translate" size={18} color={colors.primary} />
            </View>
            <View style={styles.textWrap}>
              <Text style={styles.rowTitle}>{t("settings.language")}</Text>
              <Text style={styles.rowSubTitle}>{t("settings.language_subtitle")}</Text>
            </View>
            <LanguageSwitcher />
          </View>
        </View>

        {/* Notification Preferences */}
        <View style={[styles.card, styles.cardSpacing, { backgroundColor: themeColors.surface }]}>
          <View style={styles.row}>
            <View style={styles.iconWrap}>
              <MaterialCommunityIcons name="bell-outline" size={18} color={colors.primary} />
            </View>
            <View style={styles.textWrap}>
              <Text style={styles.rowTitle}>{t("settings.notifications")}</Text>
              <Text style={styles.rowSubTitle}>{t("settings.notifications_subtitle")}</Text>
            </View>
          </View>

          {/* Push Notifications Master Toggle */}
          <View style={styles.notificationRow}>
            <View>
              <Text style={styles.notificationTitle}>{t("settings.push_notifications")}</Text>
              <Text style={styles.notificationSubtitle}>{t("settings.push_notifications_subtitle")}</Text>
            </View>
            <Switch
              value={notifications.pushEnabled}
              onValueChange={() => toggleNotification("pushEnabled")}
              trackColor={{ false: colors.lightGray, true: colors.primary }}
              thumbColor={notifications.pushEnabled ? colors.primary : colors.white}
            />
          </View>

          {notifications.pushEnabled && (
            <>
              {/* Message Notifications */}
              <View style={styles.notificationRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.notificationTitle}>💬 {t("settings.messages")}</Text>
                  <Text style={styles.notificationSubtitle}>{t("settings.messages_subtitle")}</Text>
                </View>
                <Switch
                  value={notifications.messageNotifications}
                  onValueChange={() => toggleNotification("messageNotifications")}
                  trackColor={{ false: colors.lightGray, true: colors.primary }}
                  thumbColor={notifications.messageNotifications ? colors.primary : colors.white}
                />
              </View>

              {/* Review Notifications */}
              <View style={styles.notificationRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.notificationTitle}>⭐ {t("settings.reviews")}</Text>
                  <Text style={styles.notificationSubtitle}>{t("settings.reviews_subtitle")}</Text>
                </View>
                <Switch
                  value={notifications.reviewNotifications}
                  onValueChange={() => toggleNotification("reviewNotifications")}
                  trackColor={{ false: colors.lightGray, true: colors.primary }}
                  thumbColor={notifications.reviewNotifications ? colors.primary : colors.white}
                />
              </View>

              {/* Order Notifications */}
              <View style={styles.notificationRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.notificationTitle}>📦 {t("settings.orders")}</Text>
                  <Text style={styles.notificationSubtitle}>{t("settings.orders_subtitle")}</Text>
                </View>
                <Switch
                  value={notifications.orderNotifications}
                  onValueChange={() => toggleNotification("orderNotifications")}
                  trackColor={{ false: colors.lightGray, true: colors.primary }}
                  thumbColor={notifications.orderNotifications ? colors.primary : colors.white}
                />
              </View>

              {/* Marketing Emails */}
              <View style={styles.notificationRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.notificationTitle}>📧 {t("settings.marketing")}</Text>
                  <Text style={styles.notificationSubtitle}>{t("settings.marketing_subtitle")}</Text>
                </View>
                <Switch
                  value={notifications.marketingEmails}
                  onValueChange={() => toggleNotification("marketingEmails")}
                  trackColor={{ false: colors.lightGray, true: colors.primary }}
                  thumbColor={notifications.marketingEmails ? colors.primary : colors.white}
                />
              </View>
            </>
          )}
        </View>
      </Screen>

      <AwesomeAlert
        show={sweetAlert.show}
        showProgress={false}
        title={sweetAlert.title}
        message={sweetAlert.message}
        closeOnTouchOutside={false}
        closeOnHardwareBackPress={false}
        showCancelButton={sweetAlert.showCancel}
        showConfirmButton={true}
        cancelText="Cancel"
        confirmText={sweetAlert.showCancel ? "Confirm" : "OK"}
        confirmButtonColor={
          sweetAlert.type === "danger"
            ? colors.danger
            : sweetAlert.type === "warning"
            ? colors.warning
            : colors.primary
        }
        cancelButtonColor={colors.mediumGray}
        onCancelPressed={closeSweetAlert}
        onConfirmPressed={async () => {
          const callback = sweetAlert.onConfirm;
          closeSweetAlert();
          if (callback) await callback();
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  subtitle: {
    marginTop: 6,
    marginBottom: 14,
    fontSize: 14,
    color: colors.textSecondary,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  cardSpacing: {
    marginTop: 14,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.lighterGray,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.infoLight,
    marginRight: 10,
  },
  textWrap: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  rowSubTitle: {
    marginTop: 2,
    fontSize: 12,
    color: colors.textSecondary,
  },
  notificationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.lighterGray,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  notificationSubtitle: {
    marginTop: 2,
    fontSize: 12,
    color: colors.textSecondary,
  },
});

export default SettingsScreen;

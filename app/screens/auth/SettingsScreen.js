import React from "react";
import { StyleSheet, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import Screen from "../../components/Screen";
import Text from "../../components/Text";
import colors from "../../config/colors";

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
  return (
    <Screen style={styles.screen} paddingSize="lg">
      <Text style={styles.title}>App Settings</Text>
      <Text style={styles.subtitle}>Manage your preferences and app behavior.</Text>

      <View style={styles.card}>
        <SettingRow
          icon="bell-outline"
          title="Notifications"
          subTitle="Control push and in-app notifications"
        />
        <SettingRow
          icon="theme-light-dark"
          title="Appearance"
          subTitle="Adjust theme and display options"
        />
      </View>
    </Screen>
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
});

export default SettingsScreen;

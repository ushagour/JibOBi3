import React from "react";
import { StyleSheet, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import Screen from "../../components/Screen";
import Text from "../../components/Text";
import colors from "../../config/colors";

function HelpSupportScreen() {
  return (
    <Screen style={styles.screen} paddingSize="lg">
      <Text style={styles.title}>Help & Support</Text>
      <Text style={styles.subtitle}>Find answers, contact support, and get help with your account.</Text>

      <View style={styles.card}>
        <View style={styles.row}>
          <View style={styles.iconWrap}>
            <MaterialCommunityIcons name="chat-question-outline" size={18} color={colors.primary} />
          </View>
          <View style={styles.textWrap}>
            <Text style={styles.rowTitle}>FAQs</Text>
            <Text style={styles.rowSubTitle}>Common questions and quick answers</Text>
          </View>
        </View>
        <View style={styles.row}>
          <View style={styles.iconWrap}>
            <MaterialCommunityIcons name="email-outline" size={18} color={colors.primary} />
          </View>
          <View style={styles.textWrap}>
            <Text style={styles.rowTitle}>Contact Support</Text>
            <Text style={styles.rowSubTitle}>Reach out to the team for help</Text>
          </View>
        </View>
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

export default HelpSupportScreen;

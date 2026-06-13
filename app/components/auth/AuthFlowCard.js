import React from "react";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Platform, StyleSheet, Text, View } from "react-native";

import colors from "../../config/colors";

function AuthFlowCard({ icon, title, subtitle, children, iconColors }) {
  return (
    <View style={styles.card}>
      <LinearGradient colors={iconColors || [colors.primaryDark, colors.primaryLight]} style={styles.iconWrap}>
        <MaterialCommunityIcons name={icon} size={34} color="#FFF" />
      </LinearGradient>

      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}

      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 18,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 18,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: colors.textPrimary,
    textAlign: "center",
  },
  subtitle: {
    marginTop: 8,
    marginBottom: 20,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
});

export default AuthFlowCard;

import React from "react";
import { View, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import Text from "./Text";
import colors from "../config/colors";

const Badge = ({ name, label, color, backgroundColor }) => (
  <View style={[styles.badge, { backgroundColor }]}>
    <MaterialCommunityIcons name={name} size={14} color={color} />
    <Text style={[styles.badgeLabel, { color }]}>{label}</Text>
  </View>
);

function Badges({ user, size = "sm" }) {
  if (!user) return null;

  const { isPhoneVerified, isQuickResponder } = user;

  if (!isPhoneVerified && !isQuickResponder) return null;

  return (
    <View style={styles.container}>
      {isPhoneVerified && (
        <Badge
          name="phone-check"
          label="Verified Phone"
          color={colors.success}
          backgroundColor={colors.successLight}
        />
      )}
      {isQuickResponder && (
        <Badge
          name="rocket-launch"
          label="Quick Responder"
          color={colors.secondary}
          backgroundColor={colors.secondaryLight}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    marginVertical: 4,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 6,
  },
  badgeLabel: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: "600",
  },
});

export default Badges;
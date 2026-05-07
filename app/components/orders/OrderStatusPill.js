import React from "react";
import { StyleSheet, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import Text from "../Text";
import colors from "../../config/colors";

function getStatusMeta(status) {
  const normalized = String(status || "pending").toLowerCase();

  if (normalized === "completed") {
    return {
      label: "Completed",
      icon: "check-circle-outline",
      color: colors.success,
      backgroundColor: colors.successLight,
    };
  }

  if (normalized === "cancelled") {
    return {
      label: "Cancelled",
      icon: "close-circle-outline",
      color: colors.danger,
      backgroundColor: colors.dangerLight,
    };
  }

  return {
    label: "Pending",
    icon: "clock-outline",
    color: colors.warning,
    backgroundColor: colors.warningLight,
  };
}

function OrderStatusPill({ status }) {
  const meta = getStatusMeta(status);

  return (
    <View style={[styles.container, { backgroundColor: meta.backgroundColor }]}> 
      <MaterialCommunityIcons name={meta.icon} size={12} color={meta.color} />
      <Text style={[styles.text, { color: meta.color }]}>{meta.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 4,
    gap: 4,
  },
  text: {
    fontSize: 11,
    fontWeight: "700",
  },
});

export default OrderStatusPill;

import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";

import Text from "./Text";

const categoryColors = [
  "#006D6F",
  "#C37D4E",
  "#2196F3",
  "#4BB543",
  "#FF9F40",
  "#6B5B95",
  "#E05A47",
  "#2E8B57",
];

const getCategoryColor = (item) => {
  const key = Number.isFinite(Number(item?.id)) ? Number(item.id) : 0;
  return categoryColors[Math.abs(key) % categoryColors.length];
};

function CategoryPickerItem({ item, onPress }) {
  const color = getCategoryColor(item);


  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.iconFrame}>
        <View
          style={[
            styles.iconBubble,
            {
              backgroundColor: color,
            },
          ]}
        >
          <Text style={styles.emoji}>{item.icon || "📦"}</Text>
        </View>
      </View>
      <Text style={styles.label} numberOfLines={2}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    paddingVertical: 12,
    alignItems: "center",
    width: "33%",
  },
  iconFrame: {
    width: 82,
    height: 82,
    borderRadius: 24,
    backgroundColor: "#F7F9FA",
    borderWidth: 1,
    borderColor: "#E6EAED",
    justifyContent: "center",
    alignItems: "center",
  },
  iconBubble: {
    width: 68,
    height: 68,
    borderRadius: 34,
    justifyContent: "center",
    alignItems: "center",
  },
  emoji: {
    fontSize: 28,
    lineHeight: 32,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 8,
    textAlign: "center",
    lineHeight: 16,
    minHeight: 32,
  },
});

export default CategoryPickerItem;

import React from "react";
import { View } from "react-native";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";

const FALLBACK_ICON_NAME = "help-circle";
const MATERIAL_FALLBACK_ICON_NAME = "help";

const EMOJI_TO_MATERIAL_ICON = {
  "📦": "inventory-2",
  "🎮": "sports-esports",
  "👗": "checkroom",
  "🏠": "home",
  "🚗": "directions-car",
  "📱": "smartphone",
  "💻": "laptop",
  "📚": "menu-book",
  "🍔": "restaurant",
  "⚽": "sports-soccer",
};

const getSafeIconName = (name, library) => {
  const raw = typeof name === "string" ? name.trim() : "";
  const normalized =
    library === "material" ? EMOJI_TO_MATERIAL_ICON[raw] || raw : raw;
  const fallback =
    library === "material" ? MATERIAL_FALLBACK_ICON_NAME : FALLBACK_ICON_NAME;
  if (!normalized) return fallback;

  const glyphMap =
    library === "material"
      ? MaterialIcons.glyphMap
      : MaterialCommunityIcons.glyphMap;

  return glyphMap?.[normalized]
    ? normalized
    : fallback;
};

function Icon({
  name,
  size = 40,
  backgroundColor = "#000",
  iconColor = "#fff",
  library = "community",
}) {
  const safeIconName = getSafeIconName(name, library);
  const IconSet = library === "material" ? MaterialIcons : MaterialCommunityIcons;

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <IconSet
        name={safeIconName}
        color={iconColor}
        size={size * 0.5}
      />
    </View>
  );
}

export default Icon;

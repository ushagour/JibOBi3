import React, { useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import colors from "../config/colors";

/**
 * Avatar Component
 * Displays user avatar with image or initials fallback
 *
 * @param {Object} props
 * @param {string} props.name - User name (for initials)
 * @param {string} props.avatar - Avatar image URI
 * @param {number} props.size - Avatar size in pixels (default: 40)
 * @param {string} props.bgColor - Background color for initials (default: colors.primary)
 * @param {string} props.textColor - Text color for initials (default: white)
 * @param {string} props.borderColor - Border color (default: #D9D9D9)
 * @param {boolean} props.showBorder - Show border (default: true)
 * @param {boolean} props.showShadow - Show shadow effect (default: false)
 * @param {boolean} props.isVerified - Show verified badge (default: false)
 */
const Avatar = ({
  name = "",
  avatar = null,
  size = 40,
  bgColor = colors.primary,
  textColor = "white",
  borderColor = "#D9D9D9",
  showBorder = true,
  showShadow = false,
  isVerified = false,
}) => {
  const [imageError, setImageError] = useState(false);

  const initial = name?.trim()?.charAt(0)?.toUpperCase() || "?";
  const showImage = avatar && !imageError;

  return (
    <View>
      <View
        style={[
          styles.container,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: showImage ? "transparent" : bgColor,
            borderWidth: showBorder ? 1 : 0,
            borderColor,
          },
          showShadow && styles.shadow,
        ]}
      >
        {showImage ? (
          <Image
            source={{ uri: avatar }}
            style={[
              styles.image,
              { width: size, height: size, borderRadius: size / 2 },
            ]}
            onError={() => setImageError(true)}
          />
        ) : (
          <Text
            style={[
              styles.initial,
              {
                fontSize: size * 0.5,
                color: textColor,
              },
            ]}
          >
            {initial}
          </Text>
        )}
      </View>
      {isVerified && size >= 30 && (
        <View
          style={[
            styles.verifiedBadge,
            { width: size * 0.35, height: size * 0.35, borderRadius: (size * 0.35) / 2 },
          ]}
        >
          <MaterialCommunityIcons
            name="check-circle"
            size={size * 0.3}
            color="#C5A059"
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  initial: {
    fontWeight: "700",
    textAlign: "center",
    textAlignVertical: "center",
  },
  shadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  verifiedBadge: {
    position: "absolute",
    bottom: -4,
    right: -4,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#C5A059",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default Avatar;

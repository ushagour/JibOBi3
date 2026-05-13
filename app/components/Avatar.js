import React, { useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
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
 */
const Avatar = ({
  name = "",
  avatar = null,
  size = 40,
  bgColor = colors.primary,
  textColor = "white",
  borderColor = "#D9D9D9",
  showBorder = true,
}) => {
  const [imageError, setImageError] = useState(false);

  const initial = name?.trim()?.charAt(0)?.toUpperCase() || "?";
  const showImage = avatar && !imageError;

  return (
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
});

export default Avatar;

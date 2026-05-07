import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import routes from "../navigation/routes";

function TopActionBar({
  navigation,
  showBack = true,
  showProfile = true,
  onBackPress,
  onProfilePress,
  style,
  preserveLayout = true,
  iconColor = "#0C2D31",
}) {
  if (!navigation) return null;

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
      return;
    }

    if (navigation.canGoBack && navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    navigation.navigate(routes.LISTINGS);
  };

  const handleProfile = () => {
    if (onProfilePress) {
      onProfilePress();
      return;
    }

    navigation.navigate(routes.ACCOUNT);
  };

  const renderBack = () => {
    if (!showBack) {
      return preserveLayout ? <View style={styles.placeholder} /> : null;
    }

    return (
      <TouchableOpacity onPress={handleBack} style={styles.button} activeOpacity={0.8}>
        <MaterialCommunityIcons name="chevron-left" size={28} color={iconColor} />
      </TouchableOpacity>
    );
  };

  const renderProfile = () => {
    if (!showProfile) {
      return preserveLayout ? <View style={styles.placeholder} /> : null;
    }

    return (
      <TouchableOpacity onPress={handleProfile} style={styles.button} activeOpacity={0.8}>
        <MaterialCommunityIcons name="account-circle-outline" size={28} color={iconColor} />
      </TouchableOpacity>
    );
  };

  return <View style={[styles.container, style]}>{renderBack()}{renderProfile()}</View>;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  button: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8E1D6",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  placeholder: {
    width: 42,
    height: 42,
  },
});

export default TopActionBar;

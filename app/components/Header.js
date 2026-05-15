import React from "react";
import { View, Text, StyleSheet } from "react-native";
import useAuth from "../auth/useAuth";
import colors from "../config/colors";

function Header() {
  const { user } = useAuth();

  return (
    <View style={styles.headerBlock}>
      <Text style={styles.userNameText}>{user?.name || "User"} 👋</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  headerBlock: {
    borderBottomColor: colors.lightGray,
  },
  greetingText: {
    color: colors.medium,
    fontSize: 12,
    fontWeight: "600",
  },
  userNameText: {
    color: colors.dark,
    fontSize: 24,
    fontWeight: "800",
    marginTop: 1,
  },
});

export default Header;

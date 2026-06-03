import React, { useState, useEffect } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import Constants from "expo-constants";
import { useNetInfo } from "@react-native-community/netinfo";

import Text from "./Text";
import colors from "../config/colors";
import { MaterialIcons } from "@expo/vector-icons";

function OfflineNotice(props) {
  const netInfo = useNetInfo();
  const [dismissed, setDismissed] = useState(false);

  // Reset dismissal when network status changes back to online
  useEffect(() => {
    if (netInfo.isInternetReachable) {
      setDismissed(false);
    }
  }, [netInfo.isInternetReachable]);

  if (netInfo.type !== "unknown" && netInfo.isInternetReachable === false && !dismissed) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>No Internet Connection</Text>
        <TouchableOpacity style={styles.closeButton} onPress={() => setDismissed(true)} accessibilityLabel="Dismiss">
          <MaterialIcons name="close" size={18} color={colors.white} />
        </TouchableOpacity>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: colors.primary,
    height: 50,
    justifyContent: "center",
    position: "absolute",
    top: Constants.statusBarHeight,
    width: "100%",
    zIndex: 1,
  },
  text: {
    color: colors.white,
    fontWeight: "600",
  },
  closeButton: {
    position: "absolute",
    right: 12,
    top: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default OfflineNotice;

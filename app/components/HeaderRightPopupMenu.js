import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Modal, Platform, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";

import colors from "../config/colors";
import useAuth from "../auth/useAuth";
import notificationsApi from "../api/notifications";
import routes from "../navigation/routes";

function HeaderRightPopupMenu({ navigation }) {
  const { isLoggedIn } = useAuth();
  const loggedIn = isLoggedIn();
  const [visible, setVisible] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  const menuItems = useMemo(
    () => [
      {
        id: "notifications",
        icon: "bell-outline",
        label: "Notifications",
        onPress: () => {
          setVisible(false);
          navigation?.navigate(routes.NOTIFICATIONS);
        },
      },
      {
        id: "settings",
        icon: "cog-outline",
        label: "Settings",
        onPress: () => {
          setVisible(false);
          navigation?.navigate(routes.SETTINGS);
        },
      },
    ],
    [navigation]
  );

  const loadNotifications = useCallback(async () => {
    if (!loggedIn) return;

    setLoadingNotifications(true);
    try {
      const response = await notificationsApi.getNotifications({ limit: 100 });
      if (!response.ok || !response.data) {
        Alert.alert("Error", "Could not load notifications.");
        return;
      }

      setUnreadCount(response.data.unreadCount || 0);
    } catch (error) {
      if (__DEV__) console.error("Failed to load notifications:", error);
      Alert.alert("Error", "Could not load notifications.");
    } finally {
      setLoadingNotifications(false);
    }
  }, [loggedIn]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  useFocusEffect(
    useCallback(() => {
      loadNotifications();
    }, [loadNotifications])
  );

  if (!loggedIn) return null;

  return (
    <>
      <View style={styles.triggerRow}>
        <TouchableOpacity
          style={styles.triggerButton}
          onPress={() => navigation?.navigate(routes.NOTIFICATIONS)}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="bell-outline" size={22} color="black" />
          {unreadCount > 0 && (
            <View style={styles.badgeWrap}>
              <Text style={styles.badgeText}>{unreadCount > 99 ? "99+" : unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.triggerButton}
          onPress={() => setVisible(true)}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="cog-outline" size={22} color="black" />
        </TouchableOpacity>
      </View>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <View style={styles.backdropWrap}>
          <Pressable style={styles.backdrop} onPress={() => setVisible(false)} />

          <View style={[styles.menuCard, Platform.OS === "ios" && styles.menuCardIos]}>
            {Platform.OS === "ios" && <View style={styles.sheetHandle} />}
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.menuRow,
                  index !== menuItems.length - 1 && styles.menuRowDivider,
                ]}
                activeOpacity={0.8}
                onPress={item.onPress}
              >
                <MaterialCommunityIcons name={item.icon} size={18} color={colors.primary} />
                <Text style={styles.menuText}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  triggerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginRight: 10,
  },
  triggerButton: {
    marginRight: 15,
    position: "relative",
  },
  badgeWrap: {
    position: "absolute",
    top: -5,
    right: -5,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.danger,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 10,
    color: colors.white,
    fontWeight: "700",
  },
  backdropWrap: {
    flex: 1,
    justifyContent: Platform.OS === "ios" ? "flex-end" : "flex-start",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15, 23, 42, 0.28)",
  },
  menuCard: {
    width: Platform.OS === "ios" ? "100%" : 204,
    borderRadius: Platform.OS === "ios" ? 22 : 14,
    borderWidth: 1,
    borderColor: colors.lightGray,
    backgroundColor: colors.white,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: Platform.OS === "ios" ? 0.14 : 0.2,
    shadowRadius: Platform.OS === "ios" ? 18 : 10,
    shadowOffset: { width: 0, height: Platform.OS === "ios" ? -4 : 6 },
    elevation: Platform.OS === "ios" ? 14 : 8,
    marginHorizontal: Platform.OS === "ios" ? 10 : 0,
    marginBottom: Platform.OS === "ios" ? 10 : 0,
    alignSelf: Platform.OS === "ios" ? "stretch" : "flex-end",
  },
  menuCardIos: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    paddingTop: 4,
    paddingBottom: 14,
    borderBottomWidth: 0,
    maxHeight: 260,
  },
  sheetHandle: {
    alignSelf: "center",
    width: 42,
    height: 5,
    borderRadius: 999,
    backgroundColor: colors.lightGray,
    marginTop: 8,
    marginBottom: 10,
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  menuRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.lighterGray,
  },
  menuText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: "600",
  },
});

export default HeaderRightPopupMenu;

import React, { useCallback, useEffect, useState } from "react";
import { Alert, FlatList, Pressable, StyleSheet, TouchableOpacity, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

import Screen from "../../components/Screen";
import AppText from "../../components/Text";
import colors from "../../config/colors";
import notificationsApi from "../../api/notifications";
import useTheme from "../../hooks/useTheme";

import ListItemCard from "../../components/cards/ListItemCard";
import ListItemSeparator from "../../components/ListItemSeparator";
import ListItemDeleteAction from "../../components/ListItemDeleteAction";
import Avatar from "../../components/Avatar";   
import useAuth from "../../auth/useAuth";
import ordersApi from "../../api/orders";


function NotificationsScreen({ navigation }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { colors: themeColors, isDark } = useTheme();

  const loadNotifications = useCallback(async () => {
    setLoading(true);

    try {
      const response = await notificationsApi.getNotifications({ limit: 100 });
      if (!response.ok || !response.data) {
        Alert.alert("Error", "Could not load notifications.");
        return;
      }

      setNotifications(response.data.notifications || []);
      setUnreadCount(response.data.unreadCount || 0);
      console.log("Loaded notifications:", response.data.notifications);

    } catch (error) {
      if (__DEV__) console.error("Failed to load notifications:", error);
      Alert.alert("Error", "Could not load notifications.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  useFocusEffect(
    useCallback(() => {
      loadNotifications();
    }, [loadNotifications])
  );

  const handleToggleRead = async (notification) => {
    const result = await notificationsApi.updateNotification(notification.id, {
      is_read: !notification.is_read,
    });

    if (!result.ok) {
      Alert.alert("Error", "Could not update notification.");
      return;
    }

    setNotifications((current) =>
      current.map((item) => (item.id === notification.id ? result.data : item))
    );
    setUnreadCount((current) => (notification.is_read ? current + 1 : Math.max(current - 1, 0)));
  };

  const handleDeleteNotification = async (notificationId) => {
    const result = await notificationsApi.deleteNotification(notificationId);
    if (!result.ok) {
      Alert.alert("Error", "Could not delete notification.");
      return;
    }

    setNotifications((current) => current.filter((item) => item.id !== notificationId));
    setUnreadCount((current) => {
      const deleted = notifications.find((item) => item.id === notificationId);
      if (!deleted || deleted.is_read) return current;
      return Math.max(current - 1, 0);
    });
  };

  const handleMarkAllRead = async () => {
    const result = await notificationsApi.markAllAsRead();
    if (!result.ok) {
      Alert.alert("Error", "Could not mark notifications as read.");
      return;
    }

    setNotifications((current) =>
      current.map((item) => ({
        ...item,
        is_read: true,
        read_at: item.read_at || new Date().toISOString(),
      }))
    );
    setUnreadCount(0);
  };

  const getNotificationTypeMeta = (type) => {
    if (type === "like") return { label: "Like", icon: "heart", color: colors.danger };
    if (type === "review") return { label: "Review", icon: "star", color: colors.warning };
    if (type === "message") return { label: "Message", icon: "email", color: colors.info };
    return { label: "Update", icon: "bell-outline", color: colors.medium };
  };

  const renderRightActions = (item) => (
    <View style={styles.swipeActionsContainer}>
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.swipeReadAction}
        onPress={() => handleToggleRead(item)}
      >
        <AppText style={styles.swipeActionText}>{item.is_read ? "Unread" : "Read"}</AppText>
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.swipeDeleteAction}
        onPress={() => handleDeleteNotification(item.id)}
      >
        <AppText style={styles.swipeActionText}>Delete</AppText>
      </TouchableOpacity>
    </View>
  );

  return (
    <Screen scrollable={false} style={styles.screen} paddingSize="lg">
      <View style={styles.headerRow}>
        <View>
      
          <AppText color="textSecondary" style={styles.subtitle}>
            Review all your alerts in one place
          </AppText>
        </View>

      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity onPress={handleMarkAllRead} activeOpacity={0.8}>
          <AppText style={styles.actionText}>Mark All Read</AppText>
        </TouchableOpacity>
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => String(item.id)}
        ItemSeparatorComponent={ListItemSeparator}
        onRefresh={loadNotifications}
        refreshing={loading}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="bell-off-outline" size={34} color={colors.medium} />
            <AppText style={styles.emptyText}>No notifications yet.</AppText>
          </View>
        }
        renderItem={({ item }) => {
          const meta = getNotificationTypeMeta(item.type);
          const timeAgo = dayjs(item.createdAt).fromNow();
          const formattedDate = dayjs(item.createdAt).format("MMM DD, YYYY");
          const formattedTime = dayjs(item.createdAt).format("h:mm A");

          return (
            <Pressable
              onPress={async () => {
                if (!item.is_read) {
                  await handleToggleRead(item);
                }
                if (item.type === "order" && item.order_id) {
                  navigation.navigate("OrderDetails", { order: { id: item.order_id } });
                } else if (item.type === "review" && item.listing_id) {
                  navigation.navigate("ListingDetails", { id: item.listing_id });
                }
              }}
              style={[
                styles.notificationCard,
                { backgroundColor: themeColors.surface },
                item.is_read ? styles.readCard : styles.unreadCard,
              ]}
            >
              <Avatar
                name={item?.actor?.name}
                avatar={item?.actor?.avatar}
                size={40}
              />

              <View style={styles.notificationContentWrapper}>
                <View style={styles.notificationHeader}>
                  <AppText style={styles.notificationTitle}>
                    {item?.actor?.name || "User"}
                  </AppText>
                  <AppText style={styles.notificationTime}>
                    {timeAgo}
                  </AppText>
                </View>

                <AppText style={styles.notificationContent}>
                  {item.content}
                </AppText>

                <View style={styles.dateTimeRow}>
                  <AppText style={styles.dateTimeText}>
                    📅 {formattedDate}
                  </AppText>
                  <AppText style={styles.dateTimeText}>
                    🕐 {formattedTime}
                  </AppText>
                </View>
              </View>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => handleDeleteNotification(item.id)}
                style={styles.deleteIconButton}
              >
                <MaterialCommunityIcons
                  name="trash-can-outline"
                  size={20}
                  color={colors.danger}
                />
              </TouchableOpacity>
            </Pressable>
          );
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.background,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 14,
  },
  title: {
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
  },
  badgeWrap: {
    minWidth: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.danger,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
    marginTop: 4,
  },
  badgeText: {
    color: colors.white,
    fontWeight: "700",
    fontSize: 12,
  },
  actionsRow: {
    alignItems: "flex-end",
    marginBottom: 10,
  },
  actionText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "600",
  },
  listContent: {
    paddingBottom: 18,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    gap: 10,
  },
  emptyText: {
    color: colors.medium,
    fontSize: 14,
  },
  notificationCard: {
    flexDirection: "row",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1.5,
    alignItems: "flex-start",
    gap: 12,
    backgroundColor: colors.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  unreadCard: {
    borderColor: colors.primary,
    backgroundColor: "#f8f9ff",
  },
  readCard: {
    backgroundColor: colors.lighterGray,
    borderColor: colors.lightGray,
    opacity: 0.85,
  },
  notificationContentWrapper: {
    flex: 1,
    gap: 8,
  },
  notificationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  notificationTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: "700",
    flex: 1,
  },
  notificationTime: {
    color: colors.textTertiary,
    fontSize: 12,
    fontWeight: "500",
  },
  notificationContent: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  dateTimeRow: {
    flexDirection: "row",
    gap: 12,
    paddingTop: 6,
  },
  dateTimeText: {
    color: colors.medium,
    fontSize: 11,
    fontWeight: "500",
  },
  metaRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    paddingTop: 4,
  },
  metaBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  metaBadgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: "600",
  },
  statusBadge: {
    fontSize: 10,
    fontWeight: "600",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  readBadge: {
    backgroundColor: "#e8f5e9",
    color: colors.success || "#4caf50",
  },
  unreadBadge: {
    backgroundColor: "#fff3e0",
    color: colors.warning || "#ff9800",
  },
  deleteIconButton: {
    padding: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  swipeActionsContainer: {
    flexDirection: "row",
    marginBottom: 10,
  },
  swipeReadAction: {
    backgroundColor: colors.info,
    justifyContent: "center",
    alignItems: "center",
    width: 76,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  swipeDeleteAction: {
    backgroundColor: colors.danger,
    justifyContent: "center",
    alignItems: "center",
    width: 76,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
  },
  swipeActionText: {
    color: colors.white,
    fontWeight: "700",
    fontSize: 12,
  },
});

export default NotificationsScreen;
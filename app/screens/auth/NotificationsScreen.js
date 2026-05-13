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
          <AppText variant="h2" color="textPrimary" style={styles.title}>
            Notifications
          </AppText>
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

          return (
            <ListItemCard
              title={item.title}
              subTitle={`${item.content}\n${timeAgo}`}
              isRead={item.is_read}
              IconComponent={
                <View style={styles.notificationTypeRow}>
                  <AppText style={[styles.notificationTypeText, { color: meta.color }]}>
                  <Avatar
                    name={item?.buyer?.name}
                    avatar={item?.buyer?.avatar}
                    size={35}
                  />
                                        </AppText>
                </View>
              }
              onPress={async () => {
                if (!item.is_read) {
                  await handleToggleRead(item);
                }
                navigation.navigate("ListingDetails", { listingId: item.listing_id });
              }}
              renderRightActions={() => renderRightActions(item)}
            />
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
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.lightGray,
    alignItems: "center",
  },
  unreadCard: {
    borderColor: colors.primary,
    backgroundColor: colors.infoLight,
  },
  notificationTypeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  notificationTypeText: {
    fontSize: 12,
    fontWeight: "700",
  },
  notificationTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: "700",
  },
  notificationContent: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 3,
  },
  deleteButton: {
    padding: 6,
    marginLeft: 10,
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
  notificationContentWrapper: {
    flex: 1,
  },
  

});

export default NotificationsScreen;
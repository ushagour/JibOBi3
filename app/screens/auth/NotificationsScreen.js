import React, { useCallback, useEffect, useState } from "react";
import { Alert, FlatList, Pressable, StyleSheet, TouchableOpacity, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useTranslation } from "react-i18next";

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
import ordersApi from "../../api/orders";


function NotificationsScreen({ navigation }) {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { colors: themeColors, isDark } = useTheme();

  const loadNotifications = useCallback(async () => {
    setLoading(true);

    try {
      const response = await notificationsApi.getNotifications({ limit: 100 });
      if (!response.ok || !response.data) {
        Alert.alert(t("common.error"), t("notifications_screen.load_error"));
        return;
      }

      setNotifications(response.data.notifications || []);
      setUnreadCount(response.data.unreadCount || 0);

    } catch (error) {
      if (__DEV__) console.error("Failed to load notifications:", error);
      Alert.alert(t("common.error"), t("notifications_screen.load_error"));
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
      Alert.alert(t("common.error"), t("notifications_screen.update_error"));
      return;
    }

    setNotifications((current) =>
      current.map((item) => {
        if (item.id !== notification.id) return item;
        // Ensure relations (actor, listing) are preserved if backend response doesn't include them
        const updated = result.data || {};
        return {
          ...item,
          ...updated,
          actor: updated.actor || item.actor,
          listing: updated.listing || item.listing,
        };
      })
    );
    setUnreadCount((current) => (notification.is_read ? current + 1 : Math.max(current - 1, 0)));
  };

  const handleDeleteNotification = async (notificationId) => {
    const result = await notificationsApi.deleteNotification(notificationId);
    if (!result.ok) {
      Alert.alert(t("common.error"), t("notifications_screen.delete_error"));
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
      Alert.alert(t("common.error"), t("notifications_screen.mark_read_error"));
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
    if (type === "like") return { label: t("notifications_screen.type_like"), icon: "heart", color: colors.danger };
    if (type === "review") return { label: t("notifications_screen.type_review"), icon: "star", color: colors.warning };
    if (type === "message") return { label: t("notifications_screen.type_message"), icon: "email", color: colors.info };
    return { label: t("notifications_screen.type_update"), icon: "bell-outline", color: colors.medium };
  };

  const renderRightActions = (item) => (
    <View style={styles.swipeActionsContainer}>
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.swipeReadAction}
        onPress={() => handleToggleRead(item)}
      >
        <AppText style={styles.swipeActionText}>{item.is_read ? t("notifications_screen.unread") : t("notifications_screen.read")}</AppText>
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.swipeDeleteAction}
        onPress={() => handleDeleteNotification(item.id)}
      >
        <AppText style={styles.swipeActionText}>{t("notifications_screen.delete")}</AppText>
      </TouchableOpacity>
    </View>
  );

  const resolveNotificationTarget = (item) => {
    // Try common places where related ids may exist (supporting different backend shapes)
    const orderId =
      item.order_id ||
      item?.data?.order_id ||
      item?.data?.order?.id ||
      item?.order?.id ||
      item?.meta?.order_id ||
      item?.payload?.order_id ||
      item?.payload?.order?.id ||
      null;

    const listingId =
      item.listing_id ||
      item?.data?.listing_id ||
      item?.listing?.id ||
      item?.meta?.listing_id ||
      item?.payload?.listing_id ||
      item?.payload?.listing?.id ||
      null;

    const conversationId =
      item.conversation_id ||
      item?.data?.conversation_id ||
      item?.meta?.conversation_id ||
      item?.payload?.conversation_id ||
      null;

    const otherUserId =
      item?.actor?.id ||
      item.actor_id ||
      item?.data?.user_id ||
      item?.payload?.user_id ||
      item?.payload?.actor?.id ||
      null;

    // Messages -> open conversation (prefer conversationId if available)
    if (item.type === "message") {
      if (conversationId) return { route: "Conversation", params: { conversationId } };
      if (otherUserId) return { route: "Conversation", params: { otherUserId, otherUserName: item?.actor?.name } };
    }

    // Orders -> order details
    if (item.type === "order" && orderId) {
      return { route: "OrderDetails", params: { order: { id: orderId } } };
    }

    // Listing-related notifications
    if (listingId) {
      return { route: "ListingDetails", params: { id: listingId } };
    }

    // Generic fallbacks
    if (orderId) return { route: "OrderDetails", params: { order: { id: orderId } } };
    if (conversationId) return { route: "Conversation", params: { conversationId } };
    if (otherUserId) return { route: "Conversation", params: { otherUserId, otherUserName: item?.actor?.name } };

    return null;
  };

  return (
    <Screen scrollable={false} style={styles.screen} paddingSize="lg">
      <View style={styles.headerRow}>
        <View>
      
          <AppText color="textSecondary" style={styles.subtitle}>
            {t("notifications_screen.subtitle")}
          </AppText>
        </View>

      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity onPress={handleMarkAllRead} activeOpacity={0.8}>
          <AppText style={styles.actionText}>{t("notifications_screen.mark_all_read")}</AppText>
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
            <AppText style={styles.emptyText}>{t("notifications_screen.empty")}</AppText>
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

                  const target = resolveNotificationTarget(item);
                  if (target) {
                    navigation.navigate(target.route, target.params);
                    return;
                  }

                  // fallback: open orders list if it's an order-type without id
                  if (item.type === "order") {
                    navigation.navigate("Orders");
                    return;
                  }

                  Alert.alert(t("notifications_screen.open_error_title"), t("notifications_screen.open_error_message"));
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
                    {item?.actor?.name || t("common.user")}
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

      {/* Conversation navigation handled above for message notifications */}
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
  modalOverlayCenter: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  replyModalCard: {
    width: "100%",
    maxWidth: 520,
    borderRadius: 14,
    padding: 16,
  },
  replyModalTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 10,
  },
  replyInput: {
    minHeight: 100,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    textAlignVertical: "top",
    marginBottom: 12,
  },
  replyActionsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  replyCancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  replyCancelText: {
    color: colors.textSecondary,
    fontWeight: "700",
  },
  replySendButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  replySendText: {
    color: colors.white,
    fontWeight: "800",
  },
});

export default NotificationsScreen;
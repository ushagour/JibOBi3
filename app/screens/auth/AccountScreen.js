import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import Swipeable from "react-native-gesture-handler/Swipeable";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { ListItem, ListItemSeparator } from "../../components/lists";
import colors from "../../config/colors";
import Icon from "../../components/Icon";
import routes from "../../navigation/routes";
import Screen from "../../components/Screen";
import useAuth from "../../auth/useAuth";
import AppText from "../../components/Text";
import { ProfileCard } from '../../components/cards/ProfileCard';
import notificationsApi from "../../api/notifications";

const menuItems = [
  {
    title: "Favorites",
    icon: {
      name: "format-list-bulleted",
      backgroundColor: colors.primary,
    },
    targetScreen: routes.Favorites,

  },
  {
    title: "My Messages",
    icon: {
      name: "email",
      backgroundColor: colors.secondary,
    },
    targetScreen: routes.MESSAGES,
  },
];

function AccountScreen({ navigation }) {
  const { user, logOut, isLoggedIn, isGuest } = useAuth();
  const loggedIn = isLoggedIn();
  const guestMode = isGuest();
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [notificationsVisible, setNotificationsVisible] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  const settingsItems = useMemo(
    () => [
      {
        id: "notifications",
        icon: "bell-outline",
        title: "Notifications",
        subTitle: "Control push and in-app notifications",
      },
      {
        id: "privacy",
        icon: "shield-check-outline",
        title: "Privacy",
        subTitle: "Review privacy and account visibility",
      },
      {
        id: "appearance",
        icon: "theme-light-dark",
        title: "Appearance",
        subTitle: "Adjust theme and display options",
      },
    ],
    []
  );

  const loadNotifications = async () => {
    setLoadingNotifications(true);

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
      setLoadingNotifications(false);
    }
  };

  useEffect(() => {
    if (!loggedIn) return;
    loadNotifications();
  }, [loggedIn]);

  const openNotifications = async () => {
    if (!loggedIn) {
      Alert.alert("Login required", "Please login to access notifications.");
      return;
    }
    setNotificationsVisible(true);
    await loadNotifications();
  };

  const handleCreateTypedNotification = async (type) => {
    const payloadByType = {
      like: {
        type: "like",
        title: "New like",
        content: "Someone liked your listing.",
      },
      review: {
        type: "review",
        title: "New review",
        content: "Someone reviewed your listing.",
      },
      message: {
        type: "message",
        title: "New message",
        content: "You have a new message.",
      },
    };

    const result = await notificationsApi.createNotification(payloadByType[type]);
    if (!result.ok) {
      Alert.alert("Error", "Could not create notification.");
      return;
    }

    await loadNotifications();
  };

  const getNotificationTypeMeta = (type) => {
    if (type === "like") {
      return { label: "Like", icon: "heart", color: colors.danger };
    }
    if (type === "review") {
      return { label: "Review", icon: "star", color: colors.warning };
    }
    if (type === "message") {
      return { label: "Message", icon: "email", color: colors.info };
    }

    return { label: "Update", icon: "bell-outline", color: colors.medium };
  };

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
      current.map((item) => ({ ...item, is_read: true, read_at: item.read_at || new Date().toISOString() }))
    );
    setUnreadCount(0);
  };

  const renderNotificationRightActions = (item) => (
    <View style={styles.swipeActionsContainer}>
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.swipeReadAction}
        onPress={() => handleToggleRead(item)}
      >
        <AppText style={styles.swipeReadText}>{item.is_read ? "Unread" : "Read"}</AppText>
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.swipeDeleteAction}
        onPress={() => handleDeleteNotification(item.id)}
      >
        <AppText style={styles.swipeDeleteText}>Delete</AppText>
      </TouchableOpacity>
    </View>
  );


  return (
    <Screen style={styles.screen} paddingSize="lg">
      <View style={styles.headerRow}>
        <AppText variant="h2" color="textPrimary" style={styles.screenTitle}>
          {guestMode ? "Guest Mode" : "Account"}
        </AppText>

        <View style={styles.headerActions}>
          {loggedIn ? (
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.headerIconButton}
              onPress={openNotifications}
            >
              <MaterialCommunityIcons name="bell-ring-outline" size={22} color={colors.dark} />
              {unreadCount > 0 && (
                <View style={styles.badgeWrap}>
                  <AppText style={styles.badgeText}>{unreadCount > 99 ? "99+" : unreadCount}</AppText>
                </View>
              )}
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.headerIconButton}
            onPress={() => setSettingsVisible(true)}
          >
            <MaterialCommunityIcons name="cog-outline" size={22} color={colors.dark} />
          </TouchableOpacity>
        </View>
      </View>
      {guestMode ? (
        <View style={styles.guestBanner}>
          <AppText style={styles.guestBannerText}>
            You are browsing as guest. Login or register to use favorites, messages, notifications, and posting.
          </AppText>

          <View style={styles.guestActionsRow}>
            <TouchableOpacity
              style={[styles.guestActionButton, styles.guestActionPrimary]}
              onPress={logOut}
            >
              <AppText style={styles.guestActionPrimaryText}>Login</AppText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.guestActionButton, styles.guestActionSecondary]}
              onPress={logOut}
            >
              <AppText style={styles.guestActionSecondaryText}>Register</AppText>
            </TouchableOpacity>
          </View>
        </View>
      ) : null}

<ProfileCard 
  // name={user?.name || ""} 
name={user.name}
  rating={5} 
  avatarUri={user?.avatar ? user.avatar : "https://gravatar.com/avatar/HASH"} 
          onPress={() => navigation.navigate(routes.USER_EDIT)}
/>



      {/* <View style={styles.sectionCard}>
        <ListItem
          title={user?.name || "My Account"}
          subTitle={user?.email || "Signed in user"}
          image={user?.userId && user?.avatar ? { uri: user.avatar } : null}
          onPress={() => navigation.navigate(routes.USER_EDIT)}
        />
      </View> */}

      {loggedIn ? (
        <>
          <AppText variant="overline" color="textTertiary" style={styles.sectionTitle}>
            Quick Actions
          </AppText>
          <View style={styles.sectionCard}>
            {menuItems.map((item, index) => (
              <View key={item.title}>
                <ListItem
                  title={item.title}
                  IconComponent={
                    <Icon
                      name={item.icon.name}
                      backgroundColor={item.icon.backgroundColor}
                    />
                  }
                  onPress={() => navigation.navigate(item.targetScreen)}
                />
                {index < menuItems.length - 1 && <ListItemSeparator />}
              </View>
            ))}
          </View>
        </>
      ) : null}

      {loggedIn ? (
        <>
          <AppText variant="overline" color="textTertiary" style={styles.sectionTitle}>
            Account Actions
          </AppText>
          <View style={styles.sectionCard}>
            <ListItem
              title="Log Out"
              IconComponent={<Icon name="logout" backgroundColor="#ffe66d" />}
              onPress={() => {
                Alert.alert("Log Out", "Are you sure you want to Log out?", [
                  { text: "Yes", onPress: () => logOut() },
                  { text: "Cancel", style: "cancel" },
                ]);
              }}
            />
          </View>
        </>
      ) : (
        <>
          <AppText variant="overline" color="textTertiary" style={styles.sectionTitle}>
            Guest Actions
          </AppText>
          <View style={styles.sectionCard}>
            <ListItem
              title="Exit Guest Mode"
              IconComponent={<Icon name="logout" backgroundColor="#ffe66d" />}
              onPress={logOut}
            />
          </View>
        </>
      )}

      <Modal
        visible={settingsVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSettingsVisible(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setSettingsVisible(false)}>
          <Pressable style={styles.modalCard}>
            <AppText style={styles.modalTitle}>Settings</AppText>
            {settingsItems.map((item, index) => (
              <View key={item.id}>
                <View style={styles.settingRow}>
                  <View style={styles.settingIconWrap}>
                    <MaterialCommunityIcons name={item.icon} size={18} color={colors.primary} />
                  </View>
                  <View style={styles.settingTextWrap}>
                    <AppText style={styles.settingTitle}>{item.title}</AppText>
                    <AppText style={styles.settingSubTitle}>{item.subTitle}</AppText>
                  </View>
                </View>
                {index !== settingsItems.length - 1 && <View style={styles.modalDivider} />}
              </View>
            ))}
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        visible={notificationsVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setNotificationsVisible(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setNotificationsVisible(false)}>
          <Pressable style={styles.notificationsCard}>
            <View style={styles.notificationsHeader}>
              <View style={styles.notificationsTitleWrap}>
                <AppText style={styles.modalTitle}>Notifications</AppText>
                <View style={styles.modalCountBadgeWrap}>
                  <AppText style={styles.modalCountBadgeText}>
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </AppText>
                </View>
              </View>
              <View style={styles.notificationsHeaderActions}>
                <TouchableOpacity
                  onPress={() => handleCreateTypedNotification("like")}
                  activeOpacity={0.8}
                >
                  <AppText style={styles.actionText}>Like</AppText>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleCreateTypedNotification("review")}
                  activeOpacity={0.8}
                >
                  <AppText style={styles.actionText}>Review</AppText>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleCreateTypedNotification("message")}
                  activeOpacity={0.8}
                >
                  <AppText style={styles.actionText}>Message</AppText>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleMarkAllRead} activeOpacity={0.8}>
                  <AppText style={styles.actionText}>Mark All Read</AppText>
                </TouchableOpacity>
              </View>
            </View>

            <FlatList
              data={notifications}
              keyExtractor={(item) => String(item.id)}
              onRefresh={loadNotifications}
              refreshing={loadingNotifications}
              contentContainerStyle={styles.notificationsContent}
              ListEmptyComponent={
                <AppText style={styles.emptyNotificationsText}>No notifications yet.</AppText>
              }
              renderItem={({ item }) => (
                <Swipeable renderRightActions={() => renderNotificationRightActions(item)}>
                  <View style={styles.notificationRow}>
                    <View style={styles.notificationTypeRow}>
                      <MaterialCommunityIcons
                        name={getNotificationTypeMeta(item.type).icon}
                        size={14}
                        color={getNotificationTypeMeta(item.type).color}
                      />
                      <AppText
                        style={[
                          styles.notificationTypeText,
                          { color: getNotificationTypeMeta(item.type).color },
                        ]}
                      >
                        {getNotificationTypeMeta(item.type).label}
                      </AppText>
                    </View>
                    <View style={styles.notificationTextWrap}>
                      <AppText style={styles.notificationTitle}>{item.title}</AppText>
                      <AppText style={styles.notificationContent}>{item.content}</AppText>
                      <AppText style={styles.notificationMeta}>
                        {item.is_read ? "Read" : "Unread"}
                      </AppText>
                    </View>
                  </View>
                </Swipeable>
              )}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.background,
  },
  screenTitle: {
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.lightGray,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
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
  sectionTitle: {
    marginTop: 14,
    marginBottom: 8,
    letterSpacing: 1,
  },
  sectionCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  guestBanner: {
    marginTop: 10,
    marginBottom: 4,
    backgroundColor: colors.warningLight,
    borderColor: colors.warning,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  guestBannerText: {
    color: colors.textPrimary,
    fontSize: 13,
    lineHeight: 18,
  },
  guestActionsRow: {
    marginTop: 10,
    flexDirection: "row",
    gap: 10,
  },
  guestActionButton: {
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderWidth: 1,
  },
  guestActionPrimary: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  guestActionSecondary: {
    backgroundColor: colors.white,
    borderColor: colors.primary,
  },
  guestActionPrimaryText: {
    color: colors.white,
    fontWeight: "700",
  },
  guestActionSecondaryText: {
    color: colors.primary,
    fontWeight: "700",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.35)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 18,
  },
  modalCard: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 14,
  },
  notificationsCard: {
    width: "100%",
    maxWidth: 520,
    maxHeight: "76%",
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 14,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 8,
  },
  modalDivider: {
    height: 1,
    backgroundColor: colors.lighterGray,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  settingIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.infoLight,
    marginRight: 10,
  },
  settingTextWrap: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  settingSubTitle: {
    marginTop: 2,
    fontSize: 12,
    color: colors.textSecondary,
  },
  notificationsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  notificationsTitleWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  modalCountBadgeWrap: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.danger,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
    marginBottom: 8,
  },
  modalCountBadgeText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: "700",
  },
  notificationsHeaderActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  actionText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.primary,
  },
  notificationsContent: {
    paddingBottom: 12,
  },
  emptyNotificationsText: {
    marginTop: 20,
    textAlign: "center",
    color: colors.textSecondary,
  },
  notificationRow: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: 12,
    padding: 10,
    backgroundColor: colors.surface,
  },
  notificationTypeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 6,
  },
  notificationTypeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  notificationTextWrap: {
    marginBottom: 2,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  notificationContent: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  notificationMeta: {
    fontSize: 12,
    color: colors.medium,
    marginTop: 4,
  },
  swipeActionsContainer: {
    flexDirection: "row",
    alignItems: "stretch",
    marginTop: 10,
    borderRadius: 12,
    overflow: "hidden",
  },
  swipeReadAction: {
    backgroundColor: colors.infoLight,
    borderWidth: 1,
    borderColor: colors.primary,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  swipeDeleteAction: {
    backgroundColor: colors.dangerLight,
    borderWidth: 1,
    borderColor: colors.danger,
    borderLeftWidth: 0,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  swipeReadText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.primary,
  },
  swipeDeleteText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.danger,
  },
});

export default AccountScreen;

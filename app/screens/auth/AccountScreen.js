import React from "react";
import { Alert, StyleSheet, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useTranslation } from "react-i18next";

import { ListItem, ListItemSeparator } from "../../components/lists";
import colors from "../../config/colors";
import Icon from "../../components/Icon";
import routes from "../../navigation/routes";
import Screen from "../../components/Screen";
import useAuth from "../../auth/useAuth";
import useTheme from "../../hooks/useTheme";
import AppText from "../../components/Text";
import { ProfileCard } from '../../components/cards/ProfileCard';
import messagesApi from "../../api/messages";




function AccountScreen({ navigation }) {
  const { user, logOut, isLoggedIn, isGuest } = useAuth();
  const { colors: themeColors } = useTheme();
  const { t } = useTranslation();
  const loggedIn = isLoggedIn();
  const guestMode = isGuest();
  const [unreadMessageCount, setUnreadMessageCount] = React.useState(0);

  // Monitor avatar changes and load unread messages
  useFocusEffect(
    React.useCallback(() => {
 
      loadUnreadMessages();

    }, [user])
  );

  const loadUnreadMessages = async () => {
    try {
      const resp = await messagesApi.getThreads();
      const contacts = resp && resp.data && (resp.data.data || resp.data) || [];
      const unreadCount = contacts.filter((c) => c.unread).length;
      setUnreadMessageCount(unreadCount);
    } catch (error) {
      console.error("Failed to load unread messages:", error);
    }
  };

const menuItems = [
  {
    titleKey: "screen_labels.my_listings",
    icon: {
      name: "format-list-bulleted",
      backgroundColor: colors.primary,
    },
    targetScreen: routes.MY_LISTINGS,
  },
  {
    titleKey: "screen_labels.my_orders",
    icon: {
      name: "cart",
      backgroundColor: colors.primary,
    },
    targetScreen: routes.ORDERS,

  },
  {
    titleKey: "screen_labels.my_messages",
    icon: {
      name: "message-text", 
      backgroundColor: colors.primary,
    },
    targetScreen: routes.CONVERSATION,
    badge: unreadMessageCount,
  },
  {
    titleKey: "screen_labels.my_wishlist",
    icon: { name: "heart", 
      backgroundColor: colors.primary },
    targetScreen: routes.FAVORITES,
  },
  {
    titleKey: "screen_labels.my_preferences",
    icon: {
      name: "cog",
      backgroundColor: colors.secondary,
    },
    targetScreen: routes.SETTINGS,
  },
  {
    titleKey: "screen_labels.my_help",
    icon: { name: "help-circle", backgroundColor: colors.secondary },
    targetScreen: routes.HELP,

  }
];

const settingsMenuItems = [
  {
    titleKey: "account_screen.logout",
    icon: { name: "logout", backgroundColor: "red" },
    onPress: () => {
      Alert.alert(t('account_screen.logout_confirm_title'), t('account_screen.logout_confirm_message'), [
        { text: t('common.yes'), onPress: () => logOut() },
        { text: t('common.cancel'), style: "cancel" },
      ]);
    }
  }
];



  return (
    <Screen style={[styles.screen, { backgroundColor: themeColors.background }]} paddingSize="lg">

      {guestMode ? (
        <View style={[styles.guestBanner, { backgroundColor: themeColors.warningLight, borderColor: themeColors.warning }]}>
          <AppText style={[styles.guestBannerText, { color: themeColors.textPrimary }]}>
            {t('account_screen.guest_banner')}
          </AppText>
        </View>
      ) : null}



      {loggedIn ? (




        <>

        <ProfileCard
          name={user?.name || ""}
          avatarUri={user?.avatar || null}
          isVerified={user?.is_verified || false}
          onPress={() => {
            navigation.navigate(routes.USER_EDIT);
          }}
        />
          <AppText variant="overline" color="textTertiary" style={styles.sectionTitle}>
            {t('account_screen.quick_actions')}
          </AppText>
          <View style={[styles.sectionCard, { backgroundColor: themeColors.surface }]}>
            {menuItems.map((item, index) => (
              <View key={`menu-${index}`}>
              <ListItem
                  title={t(item.titleKey)}
                  IconComponent={
                    <Icon
                      name={item.icon.name}
                      backgroundColor={item.icon.backgroundColor}
                    />
                  }
                  badge={item.badge}
                  onPress={() => {
                    if (item.targetScreen === routes.LISTINGS) {
                      navigation.navigate(item.targetScreen, { myListings: true });
                    } else {
                      navigation.navigate(item.targetScreen);
                    }
                  }}
                />
                {index < menuItems.length - 1 ? <ListItemSeparator /> : null}
              </View>
            ))}
          </View>
        </>
      ) : null}

      {loggedIn ? (
        <>
          <AppText variant="overline" color="textTertiary" style={styles.sectionTitle}>
            {t('account_screen.account_actions')}
          </AppText>
          <View style={[styles.sectionCard, { backgroundColor: themeColors.surface }]}>
            {settingsMenuItems.map((item, index) => (
              <View key={`settings-${index}`}>
                <ListItem
                  title={t(item.titleKey)}
                  IconComponent={
                    <Icon name={item.icon.name} backgroundColor={item.icon.backgroundColor} />
                  }
                  onPress={item.onPress ? item.onPress : () => navigation.navigate(item.targetScreen)}
                />
                {index < settingsMenuItems.length - 1 ? <ListItemSeparator /> : null}
              </View>
            ))}
          </View>
        </>
      ) : (
        <>
          <AppText variant="overline" color="textTertiary" style={styles.sectionTitle}>
            {t('account_screen.guest_actions')}
          </AppText>
          <View style={[styles.sectionCard, { backgroundColor: themeColors.surface }]}>
            <ListItem
              title={t('account_screen.exit_guest_mode')}
              IconComponent={<Icon name="logout" backgroundColor="#ffe66d" />}
              onPress={() => Alert.alert(t('account_screen.exit_guest_confirm'), t('account_screen.exit_guest_confirm'), [
                { text: t('common.yes'), onPress: () => logOut() },
                { text: t('common.cancel'), style: "cancel" },
              ])}
            />
          </View>
        </>
      )}

    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.background,
  },
  screenTitle: {
    marginBottom: 8,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    marginTop: 10,
    marginBottom: 6,
    letterSpacing: 1,
    fontSize: 11,
  },
  sectionCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
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
  guestBanner: {
    backgroundColor: colors.warningLight,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.warning,
  },
  guestBannerText: {
    color: colors.textPrimary,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "500",
  },
});

export default AccountScreen;

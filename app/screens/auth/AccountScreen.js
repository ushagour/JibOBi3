import React from "react";
import { Alert, StyleSheet, TouchableOpacity, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import { ListItem, ListItemSeparator } from "../../components/lists";
import colors from "../../config/colors";
import Icon from "../../components/Icon";
import routes from "../../navigation/routes";
import Screen from "../../components/Screen";
import useAuth from "../../auth/useAuth";
import useTheme from "../../hooks/useTheme";
import AppText from "../../components/Text";
import { ProfileCard } from '../../components/cards/ProfileCard';
import Avatar from '../../components/Avatar';





function AccountScreen({ navigation }) {
  const { user, logOut, isLoggedIn, isGuest } = useAuth();
  const { colors: themeColors, isDark } = useTheme();
  const loggedIn = isLoggedIn();
  const guestMode = isGuest();

  // Monitor avatar changes
  useFocusEffect(
    React.useCallback(() => {
      console.log("👁️ AccountScreen focused");
      console.log("👤 Current user:", user);
      console.log("📸 Current avatar:", user?.avatar);
      console.log("✅ Verified status:", user?.is_verified);
      return () => {
        console.log("👁️ AccountScreen unfocused");
      };
    }, [user])
  );

const menuItems = [
  {
    title: "My Listings",
    icon: {
      name: "format-list-bulleted",
      backgroundColor: colors.primary,
    },
    targetScreen: routes.MY_LISTINGS,
  },
  {
    title: "Orders",
    icon: {
      name: "cart",
      backgroundColor: colors.primary,
    },
    targetScreen: routes.ORDERS,

  },
  {
    title: "Conversation",
    icon: {
      name: "message-text",
      backgroundColor: colors.primary,
    },
    targetScreen: routes.CONVERSATION,  
  },
  {
    title: "Wishlist",
    icon: { name: "heart", 
      backgroundColor: colors.secondary },
    targetScreen: routes.Favorites,
  },
  {
    title: "Shipping Addresses",
    icon: { name: "map-marker", 
      backgroundColor: colors.secondary },
    targetScreen: routes.SHIPPING_ADDRESSES,
  },

];

const settingsMenuItems = [
  {
    title: "Preferences",
    icon: {
      name: "cog",
      backgroundColor: colors.primary,
    },
    targetScreen: routes.SETTINGS,
  },
  {
    title: "Privacy & Security",
    icon: { name: "shield", backgroundColor: colors.secondary },
    targetScreen: routes.PRIVACY,
  },
  {
    title: "Help & Support",
    icon: { name: "help-circle", backgroundColor: colors.secondary },
    targetScreen: routes.HELP,

  }
  ,{
    title: "logout",
    icon: { name: "logout", backgroundColor: "#ffe66d" },
    onPress: () => {
      Alert.alert("Log Out", "Are you sure you want to Log out?", [
        { text: "Yes", onPress: () => logOut() },
        { text: "Cancel", style: "cancel" },
      ]);
    }
  }
];



  return (
    <Screen style={[styles.screen, { backgroundColor: themeColors.background }]} paddingSize="lg">

      {guestMode ? (
        <View style={[styles.guestBanner, { backgroundColor: themeColors.warningLight, borderColor: themeColors.warning }]}>
          <AppText style={[styles.guestBannerText, { color: themeColors.textPrimary }]}>
            You are browsing as guest. Login or register to use favorites, notifications, and posting.
          </AppText>
        </View>
      ) : null}



      {loggedIn ? (




        <>

        <ProfileCard 
  // name={user?.name || ""} 
name={user.name}
is_quick={true}
  avatarUri={user?.avatar ? user.avatar : "https://gravatar.com/avatar/HASH"} 
  isVerified={user?.is_verified || false}
          onPress={() => {
            console.log("👤 Opening user edit screen. Current avatar:", user?.avatar);
            navigation.navigate(routes.USER_EDIT);
          }}
/>
          <AppText variant="overline" color="textTertiary" style={styles.sectionTitle}>
            Quick Actions
          </AppText>
          <View style={[styles.sectionCard, { backgroundColor: themeColors.surface }]}>
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
                                    onPress={() => {
                    if (item.targetScreen === routes.LISTINGS) {
                      navigation.navigate(item.targetScreen, { myListings: true });
                    } else {
                      navigation.navigate(item.targetScreen);
                    }
                  }}
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
          <View style={[styles.sectionCard, { backgroundColor: themeColors.surface }]}>
            {settingsMenuItems.map((item, index) => (
              <View key={item.title}>
                <ListItem
                  title={item.title}
                  IconComponent={
                    <Icon name={item.icon.name} backgroundColor={item.icon.backgroundColor} />
                  }
                  onPress={item.onPress ? item.onPress : () => navigation.navigate(item.targetScreen)}
                />
                {index < settingsMenuItems.length - 1 && <ListItemSeparator />}
              </View>
            ))}
          </View>
        </>
      ) : (
        <>
          <AppText variant="overline" color="textTertiary" style={styles.sectionTitle}>
            Guest Actions
          </AppText>
          <View style={[styles.sectionCard, { backgroundColor: themeColors.surface }]}>
            <ListItem
              title="Exit Guest Mode"
              IconComponent={<Icon name="logout" backgroundColor="#ffe66d" />}
              onPress={() => Alert.alert("Exit Guest Mode", "Are you sure you want to exit guest mode?", [
                { text: "Yes", onPress: () => logOut() },
                { text: "Cancel", style: "cancel" },
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

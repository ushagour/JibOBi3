import React from "react";
import { Alert, StyleSheet, TouchableOpacity, View } from "react-native";

import { ListItem, ListItemSeparator } from "../../components/lists";
import colors from "../../config/colors";
import Icon from "../../components/Icon";
import routes from "../../navigation/routes";
import Screen from "../../components/Screen";
import useAuth from "../../auth/useAuth";
import AppText from "../../components/Text";
import { ProfileCard } from '../../components/cards/ProfileCard';







function AccountScreen({ navigation }) {
  const { user, logOut, isLoggedIn, isGuest } = useAuth();
  const loggedIn = isLoggedIn();
  const guestMode = isGuest();
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
    <Screen style={styles.screen} paddingSize="lg">
      <View style={styles.headerRow}>
        <AppText variant="h2" color="textPrimary" style={styles.screenTitle}>
          {guestMode ? "Guest Mode" : "Account"}
        </AppText>

      </View>
      {guestMode ? (
        <View style={styles.guestBanner}>
          <AppText style={styles.guestBannerText}>
            You are browsing as guest. Login or register to use favorites, notifications, and posting.
          </AppText>
        </View>
      ) : null}





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

        <ProfileCard 
  // name={user?.name || ""} 
name={user.name}
  rating={5} 
  avatarUri={user?.avatar ? user.avatar : "https://gravatar.com/avatar/HASH"} 
          onPress={() => navigation.navigate(routes.USER_EDIT)}
/>
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
          <View style={styles.sectionCard}>
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
          <View style={styles.sectionCard}>
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
    backgroundColor: colors.white,
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
});

export default AccountScreen;

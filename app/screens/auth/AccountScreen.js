import React from "react";
import { StyleSheet, View, Alert } from "react-native";

import { ListItem, ListItemSeparator } from "../../components/lists";
import colors from "../../config/colors";
import Icon from "../../components/Icon";
import routes from "../../navigation/routes";
import Screen from "../../components/Screen";
import useAuth from "../../auth/useAuth";
import AppText from "../../components/Text";
import { ProfileCard } from '../../components/MarketplaceCards';

const menuItems = [
  {
    title: "My Listings",
    icon: {
      name: "format-list-bulleted",
      backgroundColor: colors.primary,
    },
    targetScreen: routes.MyListings,

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
  const { user, logOut } = useAuth();


  return (
    <Screen style={styles.screen} paddingSize="lg">
      <AppText variant="h2" color="textPrimary" style={styles.screenTitle}>
        Account
      </AppText>
<ProfileCard 
  // name={user?.name || ""} 
name={user.avatar}
  rating={5} 
  avatarUri={user?.avatar ? user.avatar : "https://gravatar.com/avatar/HASH"} 
/>



      {/* <View style={styles.sectionCard}>
        <ListItem
          title={user?.name || "My Account"}
          subTitle={user?.email || "Signed in user"}
          image={user?.userId && user?.avatar ? { uri: user.avatar } : null}
          onPress={() => navigation.navigate(routes.USER_EDIT)}
        />
      </View> */}

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
              { text: "No" },
            ]);
          }}
        />
      </View>
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
});

export default AccountScreen;

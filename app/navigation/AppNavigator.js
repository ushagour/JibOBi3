import React, { useEffect, useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import AccountNavigator from "./AccountNavigator";
import FeedNavigator from "./FeedNavigator";
import ListingAddScreen from "../screens/Listings/ListingAddScreen";
import NewListingButton from "./NewListingButton";
import routes from "./routes";
import navigation from "./rootNavigation";
import useNotifications from "../hooks/useNotifications";
import useAuth from "../auth/useAuth";
import colors from "../config/colors";

const Tab = createBottomTabNavigator();

const AppNavigator = () => {
  const { user } = useAuth();
  const [avatarLoadError, setAvatarLoadError] = useState(false);

  const isAuthenticated = Boolean(user?.userId);
  useNotifications(isAuthenticated);
  const userInitial = user?.name?.trim()?.charAt(0)?.toUpperCase() || "";

  useEffect(() => {
    setAvatarLoadError(false);
  }, [user?.avatar, user?.userId]);

  const avatarSource = user?.avatar && !avatarLoadError ? { uri: user.avatar } : null;

  return (
    <Tab.Navigator
    screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,

    }}
    >
      <Tab.Screen
        name="Feed"
        component={FeedNavigator}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="ListingAdd"
        component={ListingAddScreen}
        options={({ navigation }) => ({
          headerShown: true,
          headerTitle: "",
          tabBarButton: () => (isAuthenticated ? (
            <NewListingButton
              onPress={() => navigation.navigate(routes.LISTING_ADD)}
            />
          ) : null),
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="plus-circle"
              color={color}
              size={size}
            />
          ),
        })}
      />
      <Tab.Screen
        name={routes.ACCOUNT}
        component={AccountNavigator}
        options={{
          tabBarIcon: ({ color, size }) => (
            isAuthenticated && avatarSource ? (
              <View style={styles.avatarWrap}>
                <Image
                  source={avatarSource}
                  style={styles.avatar}
                  onError={() => setAvatarLoadError(true)}
                />
              </View>
            ) : isAuthenticated && userInitial ? (
              <View style={styles.avatarWrap}>
                <Text style={styles.avatarInitial}>{userInitial}</Text>
              </View>
            ) : (
              <MaterialCommunityIcons name="account" color={color} size={size} />
            )
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  avatarWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#D9D9D9",
    backgroundColor: "#F2F2F2",
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  avatarInitial: {
    flex: 1,
    textAlign: "center",
    textAlignVertical: "center",
    fontSize: 20,
    fontWeight: "700",
    color: colors.primary,
  },
});

export default AppNavigator;

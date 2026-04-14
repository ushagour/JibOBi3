import React from "react";
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

const Tab = createBottomTabNavigator();

const AppNavigator = () => {
  useNotifications();
  const { user } = useAuth();

  const isAuthenticated = Boolean(user?.userId);
  const avatarSource = user?.avatar ? { uri: user.avatar } : null;
  const userInitial = user?.name?.trim()?.charAt(0)?.toUpperCase() || "";

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
          tabBarButton: () => (
            <NewListingButton
              onPress={() => navigation.navigate(routes.LISTING_ADD)}
            />
          ),
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
        name="account"
        
        component={AccountNavigator}
        options={{
          tabBarIcon: ({ color, size }) => (
            isAuthenticated && avatarSource ? (
              <View style={styles.avatarWrap}>
                <Image source={avatarSource} style={styles.avatar} />
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
    fontSize: 14,
    fontWeight: "700",
    color: "#333333",
  },
});

export default AppNavigator;

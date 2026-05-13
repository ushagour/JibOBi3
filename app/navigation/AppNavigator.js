import React, { useEffect } from "react";
import { StyleSheet } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import AccountNavigator from "./AccountNavigator";
import FeedNavigator from "./FeedNavigator";
import ListingAddScreen from "../screens/Listings/ListingAddScreen";
import NewListingButton from "./NewListingButton";
import Avatar from "../components/Avatar";
import routes from "./routes";
import navigation from "./rootNavigation";
import useNotifications from "../hooks/useNotifications";
import useAuth from "../auth/useAuth";
import colors from "../config/colors";

const Tab = createBottomTabNavigator();

const AppNavigator = () => {
  const { user } = useAuth();

  const isAuthenticated = Boolean(user?.userId);
  useNotifications(isAuthenticated);

  useEffect(() => {
    // Cleanup or side effects if needed
  }, [user?.avatar, user?.userId]);

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
          tabBarIcon: ({ color }) =>
            isAuthenticated ? (
              <Avatar
                name={user?.name}
                avatar={user?.avatar}
                size={30}
                bgColor={colors.primary}
                textColor="white"
              />
            ) : (
              <MaterialCommunityIcons name="account" color={color} size={24} />
            ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({});

export default AppNavigator;

import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";

import AccountScreen from "../screens/auth/AccountScreen";
import MyNotificationScreen from "../screens/auth/MyNotificationScreen";
import MyListingsScreen from "../screens/Listings/MyListingsScreen";
import ListingDetailsScreen from "../screens/Listings/ListingDetailsScreen";
import UserScreen from "../screens/auth/UserScreen";
import ListingEditScreen from "../screens/Listings/ListingEditScreen";
import ViewImageScreen from "../screens/outhers/ViewImageScreen";

const Stack = createStackNavigator();

const AccountNavigator = () => (
  <Stack.Navigator
    screenOptions={({ navigation }) => ({
      headerShown: true,
      headerLeft: () => (
        <TouchableOpacity
          style={{ marginLeft: 10 }}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color="black"
          />
        </TouchableOpacity>
      ),
    })}
  >
    <Stack.Screen name="Account" component={AccountScreen} />
    <Stack.Screen name="UserEdit" component={UserScreen} />
    <Stack.Screen name="MyListings" component={MyListingsScreen} />
    <Stack.Screen name="ListingEdit" component={ListingEditScreen} />
    <Stack.Screen name="ListingDetails" component={ListingDetailsScreen} />
    <Stack.Screen options={{ headerShown: false }} name="ImageDetails" component={ViewImageScreen} />
    <Stack.Screen name="My_Notifications" component={MyNotificationScreen} />
  </Stack.Navigator>
);

export default AccountNavigator;

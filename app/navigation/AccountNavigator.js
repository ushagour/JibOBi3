import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";

import AccountScreen from "../screens/auth/AccountScreen";
import MessagesScreen from "../screens/auth/MessagesScreen";
import FavoritesScreen from "../screens/Listings/FavoritesScreen";
import ListingsScreen from "../screens/Listings/ListingsScreen";
import ListingDetailsScreen from "../screens/Listings/ListingDetailsScreen";
import UserScreen from "../screens/auth/UserScreen";
import ListingEditScreen from "../screens/Listings/ListingEditScreen";
import ViewImageScreen from "../screens/outhers/ViewImageScreen";
import ListingAddScreen from "../screens/Listings/ListingAddScreen";

const Stack = createStackNavigator();

const AccountNavigator = () => (
  <Stack.Navigator
    screenOptions={({ navigation }) => ({
      headerShown: true,
      headerTitle: "",
      headerBackTitleVisible: false,
      headerLeft: () => {
        if (!navigation.canGoBack()) return null;

        return (
          <TouchableOpacity
            style={{ marginLeft: 15 }}
            onPress={() => navigation.goBack()}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color="black"
            />
          </TouchableOpacity>
        );
      },
      headerRight: () => null,
    })}
  >
    <Stack.Screen name="Account" component={AccountScreen} />
    <Stack.Screen name="UserEdit" component={UserScreen} />
    <Stack.Screen name="Favorites" component={FavoritesScreen} />
    <Stack.Screen name="Listings" component={ListingsScreen} />
    <Stack.Screen name="AllListings" component={ListingsScreen} />
    <Stack.Screen name="ListingAdd" component={ListingAddScreen} />
    <Stack.Screen name="ListingEdit" component={ListingEditScreen} />
    <Stack.Screen name="ListingDetails" component={ListingDetailsScreen} />
    <Stack.Screen name="ImageDetails" component={ViewImageScreen} />
    <Stack.Screen name="Messages" component={MessagesScreen} />
  </Stack.Navigator>
);

export default AccountNavigator;

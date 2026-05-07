import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import ListingsScreen from "../screens/Listings/ListingsScreen";
import ListingDetailsScreen from "../screens/Listings/ListingDetailsScreen";
import ListingEditScreen from "../screens/Listings/ListingEditScreen";
import { TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import  ViewImageScreen  from "../screens/outhers/ViewImageScreen";
import HeaderRightPopupMenu from "../components/HeaderRightPopupMenu";
import NotificationsScreen from "../screens/auth/NotificationsScreen";
import OrderCheckoutScreen from "../screens/auth/OrderCheckoutScreen";
import routes from "./routes";



const Stack = createStackNavigator();

const FeedNavigator = () => (
<Stack.Navigator
  screenOptions={({ navigation }) => ({
    headerShown: true,
    headerTitle: "",
    headerBackTitleVisible: false,
    headerLeft: () => {
      if (!navigation.canGoBack()) return null;

      return (
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
      );
    },
      headerRight: () => <HeaderRightPopupMenu navigation={navigation} />,
  })}
>
    <Stack.Screen name="Listings" component={ListingsScreen} />
    <Stack.Screen name="AllListings" component={ListingsScreen} />
    <Stack.Screen name="ListingDetails" component={ListingDetailsScreen} />
    <Stack.Screen name="OrderCheckout" component={OrderCheckoutScreen} />
    <Stack.Screen  name="ListingEdit" component={ListingEditScreen} />
    <Stack.Screen options={{ headerShown: false }} name="ImageDetails" component={ViewImageScreen} />
    <Stack.Screen name="Notifications" component={NotificationsScreen} />
  </Stack.Navigator>
);

export default FeedNavigator;

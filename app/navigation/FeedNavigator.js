import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import AnimatedHeader from "../components/AnimatedHeader";
import HeaderRightPopupMenu from "../components/HeaderRightPopupMenu";
import ListingsScreen from "../screens/Listings/ListingsScreen";
import ListingDetailsScreen from "../screens/Listings/ListingDetailsScreen";
import ListingEditScreen from "../screens/Listings/ListingEditScreen";
import  ViewImageScreen  from "../screens/outhers/ViewImageScreen";
import NotificationsScreen from "../screens/auth/NotificationsScreen";
import ConversationScreen from "../screens/auth/ConversationScreen";
import OrderCheckoutScreen from "../screens/orders/OrderCheckoutScreen";
import OrderDetailScreen from "../screens/orders/OrderDetailScreen";

const Stack = createStackNavigator();

const getHeaderTitle = (routeName) => {
  const titles = {
    Listings: "Explorer",
    AllListings: "All Listings",
    ListingDetails: "Listing Details",
    OrderCheckout: "Checkout",
    ListingEdit: "Edit Listing",
    ImageDetails: "Image Details",
    Notifications: "Notifications",
  };

  return titles[routeName] || routeName;
};

const FeedNavigator = () => (
  <Stack.Navigator
    screenOptions={({ navigation, route }) => ({
      headerShown: true,
      header: ({ navigation: headerNavigation, route: headerRoute, options, back }) => (
        <AnimatedHeader
          title={options.title || getHeaderTitle(route.name)}
          subtitle={options.headerSubtitle}
          rightAction={options.headerRight ? options.headerRight({ navigation: headerNavigation, route: headerRoute }) : null}
          showBackButton={Boolean(back)}
          onBackPress={() => headerNavigation.goBack()}
        />
      ),
    })}
  >
    <Stack.Screen name="Listings" component={ListingsScreen} />
    <Stack.Screen name="AllListings" component={ListingsScreen} />
    <Stack.Screen
      name="ListingDetails"
      component={ListingDetailsScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="OrderCheckout"
      component={OrderCheckoutScreen}
      options={({ navigation }) => ({
        headerRight: () => <HeaderRightPopupMenu navigation={navigation} />,
      })}
    />
     <Stack.Screen
      name="ImageDetails"
      component={ViewImageScreen}
      options={{ title: "Image Details" }}
    />
    <Stack.Screen
      name="ListingEdit"
      component={ListingEditScreen}
      options={({ navigation }) => ({
        headerRight: () => <HeaderRightPopupMenu navigation={navigation} />,
      })}
    />
    <Stack.Screen
      name="OrderDetailScreen"
      component={OrderDetailScreen}
      options={{ title: "Order Detail" }}
    />
    <Stack.Screen
      name="Notifications"
      component={NotificationsScreen}
      options={({ navigation }) => ({
        headerRight: () => <HeaderRightPopupMenu navigation={navigation} />,
      })}
    />
    <Stack.Screen name="Conversation" component={ConversationScreen} />
  </Stack.Navigator>
);

export default FeedNavigator;

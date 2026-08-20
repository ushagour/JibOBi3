import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { useTranslation } from "react-i18next";
import AnimatedHeader from "../components/AnimatedHeader";
import HeaderRightPopupMenu from "../components/HeaderRightPopupMenu";

import AccountScreen from "../screens/auth/AccountScreen";
import FavoritesScreen from "../screens/Listings/FavoritesScreen";
import ListingsScreen from "../screens/Listings/ListingsScreen";
import ListingDetailsScreen from "../screens/Listings/ListingDetailsScreen";
import UserScreen from "../screens/auth/UserScreen";
import ListingEditScreen from "../screens/Listings/ListingEditScreen";
import ViewImageScreen from "../screens/outhers/ViewImageScreen";
import ListingAddScreen from "../screens/Listings/ListingAddScreen";
import SettingsScreen from "../screens/auth/SettingsScreen";
import NotificationsScreen from "../screens/auth/NotificationsScreen";
import ConversationScreen from "../screens/auth/ConversationScreen";
import UnifiedOrdersScreen from "../screens/orders/UnifiedOrdersScreen";
import OrderCheckoutScreen from "../screens/orders/OrderCheckoutScreen";
import OrderDetailScreen from "../screens/orders/OrderDetailScreen";
import HelpSupportScreen from "../screens/auth/HelpSupportScreen";
import AssistantScreen from "../screens/auth/AssistantScreen";
import PrivacySecurityScreen from "../screens/auth/PrivacySecurityScreen";
import MyListingsScreen from "../screens/Listings/MyListingsScreen";
import VerifyEmailScreen from "../screens/auth/VerifyEmailScreen";

const Stack = createStackNavigator();

const getHeaderTitle = (routeName, t) => {
  const navKeys = {
    AccountHome: "account",
    UserEdit: "edit_profile",
    Settings: "settings",
    Notifications: "notifications",
    Orders: "orders",
    OrderDetails: "order_details",
    OrderCheckout: "checkout",
    HelpSupport: "help_support",
    Assistant: "assistant",
    PrivacySecurity: "privacy_security",
    VerifyEmail: "verify_email",
    Favorites: "favorites",
    Listings: "listings",
    MyListings: "my_listings",
    AllListings: "all_listings",
    ListingAdd: "add_listing",
    ListingEdit: "edit_listing",
    ListingDetails: "listing_details",
    ImageDetails: "image_details",
  };

  const key = navKeys[routeName];
  return key ? t(`navigation.${key}`) : routeName;
};

const AccountNavigator = () => {
  const { t } = useTranslation();

  return (
    <Stack.Navigator
      screenOptions={({ navigation, route }) => ({
        headerShown: true,
        header: ({ navigation: headerNavigation, route: headerRoute, options, back }) => (
          <AnimatedHeader
            title={options.title || getHeaderTitle(route.name, t)}
            subtitle={options.headerSubtitle}
            rightAction={options.headerRight ? options.headerRight({ navigation: headerNavigation, route: headerRoute }) : null}
            showBackButton={Boolean(back)}
            onBackPress={() => headerNavigation.goBack()}
            
          />
        ),
      })}
    >
    <Stack.Screen
      name="AccountHome"
      component={AccountScreen}
      options={({ navigation }) => ({
        headerRight: () => <HeaderRightPopupMenu navigation={navigation} />,
      })}
    />
    <Stack.Screen name="UserEdit" component={UserScreen} options={{ headerShown: false }}  />
    <Stack.Screen name="Settings" component={SettingsScreen} />
    <Stack.Screen name="Notifications" component={NotificationsScreen} />
    <Stack.Screen name="Conversation" component={ConversationScreen} />
    <Stack.Screen name="Orders" component={UnifiedOrdersScreen} />
    <Stack.Screen name="OrderDetails" component={OrderDetailScreen} />
    <Stack.Screen name="OrderCheckout" component={OrderCheckoutScreen} />
    <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
    <Stack.Screen name="Assistant" component={AssistantScreen} />
    <Stack.Screen name="PrivacySecurity" component={PrivacySecurityScreen} />
    <Stack.Screen name="VerifyEmail" component={VerifyEmailScreen} />
    <Stack.Screen name="Favorites" component={FavoritesScreen} />
    <Stack.Screen name="Listings" component={ListingsScreen} />
    <Stack.Screen name="MyListings" component={MyListingsScreen} />
    <Stack.Screen name="AllListings" component={ListingsScreen} />
    <Stack.Screen name="ListingAdd" component={ListingAddScreen} />
    <Stack.Screen name="ListingEdit" component={ListingEditScreen} />
    <Stack.Screen name="ListingDetails" component={ListingDetailsScreen} options={{ headerShown: false }} />
    <Stack.Screen name="ImageDetails" component={ViewImageScreen} />
  
    </Stack.Navigator>
  );
};

export default AccountNavigator;

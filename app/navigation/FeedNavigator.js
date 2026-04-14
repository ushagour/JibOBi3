import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import ListingsScreen from "../screens/Listings/ListingsScreen";
import ListingDetailsScreen from "../screens/Listings/ListingDetailsScreen";
import ListingEditScreen from "../screens/Listings/ListingEditScreen";
import { TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import  ViewImageScreen  from "../screens/outhers/ViewImageScreen";
import routes from "./routes";


const Stack = createStackNavigator();

const FeedNavigator = () => (
<Stack.Navigator
  screenOptions={({ navigation }) => ({
    headerShown: true,
    headerTitle: "",
    headerBackTitleVisible: false,
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
    headerRight: () => (
      <TouchableOpacity
        style={{ marginRight: 12 }}
        onPress={() =>
          navigation.getParent()?.navigate("account", {
            screen: routes.SETTINGS,
          })
        }
      >
        <MaterialCommunityIcons name="menu" size={26} color="black" />
      </TouchableOpacity>
    ),
  })}
>
    <Stack.Screen name="Listings" component={ListingsScreen} />
    <Stack.Screen name="ListingDetails" component={ListingDetailsScreen} />
    <Stack.Screen name="ListingEdit" component={ListingEditScreen} />
    <Stack.Screen options={{ headerShown: false }} name="ImageDetails" component={ViewImageScreen} />
  </Stack.Navigator>
);

export default FeedNavigator;

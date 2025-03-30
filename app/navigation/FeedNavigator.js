import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import ListingsScreen from "../screens/Listings/ListingsScreen";
import ListingDetailsScreen from "../screens/Listings/ListingDetailsScreen";
import ListingEditScreen from "../screens/Listings/ListingEditScreen";
import { TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import  ViewImageScreen  from "../screens/outhers/ViewImageScreen";


const Stack = createStackNavigator();

const FeedNavigator = () => (
<Stack.Navigator  >
    <Stack.Screen name="Listings" component={ListingsScreen} />
    <Stack.Screen name="ListingDetails" component={ListingDetailsScreen}   screenOptions={({ navigation }) => ({
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
    })} />
    <Stack.Screen name="ListingEdit" component={ListingEditScreen} />
    <Stack.Screen options={{ headerShown: false }} name="ImageDetails" component={ViewImageScreen} />
  </Stack.Navigator>
);

export default FeedNavigator;

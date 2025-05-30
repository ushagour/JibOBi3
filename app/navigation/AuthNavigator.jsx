import React from 'react'
import { createStackNavigator } from "@react-navigation/stack";



import LoginScreen from "../screens/auth/LoginScreen";
import RegisterScreen from "../screens/auth/RegisterScreen";
import WelcomeScreen from "../screens/WelcomeScreen";




const Stack = createStackNavigator();

const AuthNavigator = () => {
  return (
    <Stack.Navigator>
    <Stack.Screen
      name="Welcome"
      component={WelcomeScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen name="Login" component={LoginScreen} options={{headerShown:false}} />
    <Stack.Screen name="Register" component={RegisterScreen} options={{headerShown:false}} />
  </Stack.Navigator>
  


)
}

export default AuthNavigator
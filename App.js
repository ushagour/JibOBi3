import React, { useState, useEffect, useCallback } from "react";
import { NavigationContainer } from "@react-navigation/native";
import * as SplashScreen from "expo-splash-screen"; // Import SplashScreen
import myTheme from "./app/navigation/myTheme";
import AppNavigator from "./app/navigation/AppNavigator";
import OfflineNotice from "./app/components/OfflineNotice";
import AuthNavigator from "./app/navigation/AuthNavigator";
import AuthContext from "./app/auth/context";
import authStorage from "./app/auth/storage";
import { navigationRef } from "./app/navigation/rootNavigation";

export default function App() {
  const [user, setUser] = useState();
  const [isReady, setIsReady] = useState(false);

  const restoreUser = async () => {
    const user = await authStorage.getUser();
    if (user) setUser(user);
    console.log(user);
  };

  useEffect(() => {
    // Prevent auto-hiding the splash screen
    SplashScreen.preventAutoHideAsync();

    // Load user data and then hide the splash screen
    const prepareApp = async () => {
      try {
        await restoreUser();
      } catch (e) {
        console.warn(e);
      } finally {
        setIsReady(true); // Set the app to ready
      }
    };

    prepareApp();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (isReady) {
      // Hide splash screen once the app is ready
      await SplashScreen.hideAsync();
    }
  }, [isReady]);

  if (!isReady) return null;

  return (
    <NavigationContainer ref={navigationRef} theme={myTheme} onReady={onLayoutRootView}>
      <OfflineNotice />
      <AuthContext.Provider  value={{ user, setUser }}>
        {user ? <AppNavigator /> : <AuthNavigator />}
      </AuthContext.Provider>
    </NavigationContainer>
  );
}

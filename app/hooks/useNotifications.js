import { useEffect } from "react";
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import expoPushTokensApi from "../api/expoPushTokens";

const useNotifications  = (notificationListener) => {
  useEffect(() => {
    if (notificationListener === false) return;

    registerForPushNotificationsAsync();

    if (typeof notificationListener === "function") {
      Notifications.addListener(notificationListener);
    }
  }, [notificationListener]);

  async function registerForPushNotificationsAsync() {
    try {
      // Request notification permissions directly from expo-notifications
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        // Silent fail - user denied permission
        return;
      }
      
      // Wrap push token request in try-catch to handle offline/network errors
      let pushTokenString;
      try {
        pushTokenString = (await Notifications.getExpoPushTokenAsync({ 
          projectId: Constants.expoConfig?.extra?.eas?.projectId 
        })).data;
      } catch (tokenError) {
        // Silent fail for push token errors - Expo will retry automatically
        // These errors are expected when offline or during network issues
        return;
      }
      
      if (!pushTokenString) return;

      // Silently attempt to register push token - will retry automatically if offline
      try {
        const result = await expoPushTokensApi.register(pushTokenString);
        // Silent fail for network errors - Expo will retry automatically
      } catch (apiError) {
        // Silent fail - Expo notifications handles retries automatically
        // Only log in development for non-network errors
        if (__DEV__ && apiError?.message && !apiError.message.includes('Network')) {
          console.debug("Push token registration info:", apiError.message);
        }
      }

    } catch (error) {
      // Silently catch all errors - Expo notifications handles retries
      // Network errors are expected and will be retried automatically by Expo
    }
  }

};

export default useNotifications;

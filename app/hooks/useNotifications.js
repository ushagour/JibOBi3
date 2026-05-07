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
        alert('Failed to get push token for push notification!');
        return;
      }
      
      const pushTokenString = (await Notifications.getExpoPushTokenAsync( { projectId: Constants.expoConfig?.extra?.eas?.projectId })).data;
      //  console.log("pushTokenString", pushTokenString);
      
      // Silently attempt to register push token - will retry automatically if offline
      const result = await expoPushTokensApi.register(pushTokenString);
      if (!result.ok && result.error?.message?.includes('Network')) {
        // Silent fail for network errors - Expo will retry automatically
        return;
      }

    } catch (error) {
      // Silently catch errors - Expo notifications handles retries
      // Only log network-related errors in development
      if (__DEV__ && error.message && !error.message.includes('Network')) {
        console.log("Error getting a push token", error);
      }
    }
  }
  


};
export default useNotifications;

import { useEffect } from "react";
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import expoPushTokensApi from "../api/expoPushTokens";
import environment from "../../environment";

const useNotifications  = (notificationListener) => {
  useEffect(() => {
    registerForPushNotificationsAsync();


    

    if (notificationListener) Notifications.addListener(notificationListener);
  }, []);



  async function registerForPushNotificationsAsync() {
    try {
      // Request notification permissions directly from expo-notifications
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        alert('Failed to get push token for push notification!');
        return;
      }
      
      const pushTokenString = (await Notifications.getExpoPushTokenAsync( { projectId:environment.projectId })).data;
      //  console.log("pushTokenString", pushTokenString);
      
      expoPushTokensApi.register(pushTokenString); 


    } catch (error) {
      console.log("Error getting a push token", error);
    }
  }
  


};
export default useNotifications;

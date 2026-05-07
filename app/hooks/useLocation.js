import { useEffect, useState } from "react";
import * as Location from "expo-location";

const useLocation = () => {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const requestPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg("Permission to access location was denied");
        return false;
      }
      return true;
    } catch (error) {
      console.error("Error requesting location permission:", error);
      setErrorMsg(error.message);
      return false;
    }
  };

  const getLocation = async () => {
    try {
      const hasPermission = await requestPermission();
      if (!hasPermission) return;

      const location = await Location.getCurrentPositionAsync({});
      if (location) {
        const { latitude, longitude } = location.coords;
      
        setLocation({ latitude, longitude });
      } else {
        setErrorMsg("Could not get current location");
      }
    } catch (error) {
      console.error("Error getting location:", error);
      setErrorMsg(error.message);
    }
  };

  useEffect(() => {
    getLocation();
  }, []);

  return { location, errorMsg, requestPermission };
};

export default useLocation;

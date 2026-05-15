import { useEffect, useRef, useState } from "react";
import * as Location from "expo-location";

const useLocation = () => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const cacheRef = useRef({});
  const lastRequestRef = useRef(0);

  // Request location permission
  const requestPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status === 'granted';
    } catch (err) {
      setError("Permission denied");
      return false;
    }
  };

  // Get current device location
  const getLocation = async () => {
    try {
      const hasPermission = await requestPermission();
      if (!hasPermission) {
        setError("Location permission not granted");
        return null;
      }

      const enabled = await Location.hasServicesEnabledAsync();
      if (!enabled) {
        setError("Location services disabled");
        return null;
      }

      const data = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeout: 10000,
      });

      if (data?.coords) {
        const coords = { latitude: data.coords.latitude, longitude: data.coords.longitude };
        setLocation(coords);
        setError(null);
        return coords;
      }
    } catch (err) {
      setError(err.message);
      return null;
    }
  };

  // Get location name (city, country) from coordinates
  const getLocationName = async (latitude, longitude) => {
    if (!latitude || !longitude) return null;

    const cacheKey = `${latitude},${longitude}`;
    if (cacheRef.current[cacheKey]) {
      return cacheRef.current[cacheKey];
    }

    // Rate limit: 1 request per second
    const now = Date.now();
    if (now - lastRequestRef.current < 1000) {
      await new Promise(resolve => 
        setTimeout(resolve, 1000 - (now - lastRequestRef.current))
      );
    }
    lastRequestRef.current = Date.now();

    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;
      const response = await fetch(url, {
        headers: { "User-Agent": "jibobi3/1.0 (ali.ouchagour01@gmail.com)" },
      });

      if (!response.ok) return null;

      const data = await response.json();
      const result = {
        city: data.address?.city || "Unknown City",
        country: data.address?.country || "Unknown Country",
      };

      cacheRef.current[cacheKey] = result;
      return result;
    } catch (err) {
      console.error("Geocoding error:", err);
      return null;
    }
  };

  useEffect(() => {
    getLocation();
  }, []);

  return { location, error, requestPermission, getLocation, getLocationName };
};

export default useLocation;

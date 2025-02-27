export const getLocationName = async (latitude, longitude) => {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;
  
    const headers = {
      "User-Agent": "jibobi3/1.0 (ali.ouchagour01@gmail.com)", // Add a user agent
    };
  
    try {
      const response = await fetch(url, { headers });
      const data = await response.json();
      console.log(data.display_name);
            
      if (data.display_name) {
        return data.display_name; // Full address (e.g., "San Francisco, CA, USA")
      } else {
        console.error("Geocoding failed:", data.error);
        return null;
      }
    } catch (error) {
      console.error("Error fetching location name:", error);
      return null;
    }
  };
export const getLocationName = async (latitude, longitude) => {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;
  
    const headers = {
      "User-Agent": "jibobi3/1.0 (ali.ouchagour01@gmail.com)", // Add a user agent
    };
  
    try {
      const response = await fetch(url, { headers });
      const data = await response.json();
      console.log(data.address.residential);
     
      if (data.display_name) {
        return {
          displayName: data.address.display_name,
          city: data.address.city,
          residential:   data.address.residential,
          country: data.address.country,
        }; // Return an object with multiple data fields
      }else {
        console.error("Geocoding failed:", data.error);
        return null;
      }
    } catch (error) {
      console.error("Error fetching location name:", error);
      return null;
    }
  };
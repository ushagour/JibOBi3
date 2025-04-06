export const getLocationName = async (latitude, longitude) => {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;
  
    
    const headers = {
      "User-Agent": "jibobi3/1.0 (ali.ouchagour01@gmail.com)", // Add a user agent
    };
  
    try {
    const response = await fetch(url, { headers });

    // Check if the response is successful
    if (!response.ok) {
      console.error(`Error fetching location name: ${response.status} ${response.statusText}`);
      return null;
    }

    const data = await response.json();

    // Check if the necessary fields are present in the response
    if (!data.address || !data.address.city || !data.address.country) {
      console.error("Error fetching location name: Incomplete data received");
      return {
        city: "Unknown City",
        country: "Unknown Country",
      };
    }

    return {
      city: data.address.city,
      country: data.address.country,
    }; // Return an object with multiple data fields
  } catch (error) {
    // console.error("Error fetching location name:", error);
    return null;
  }
  };
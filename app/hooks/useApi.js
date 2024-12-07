import { useState } from "react";

export default useApi = (apiFunc) => {
  const [data, setData] = useState([]);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  /*nb: dont modify the code below cuz we use it in multiple places*/
  const request = async (...args) => {
    setLoading(true);
    const response = await apiFunc(...args);
    // console.log("API response:", response);
  
    setLoading(false);
  
  
    setError(!response.ok);
    setData(response.data);
    return response; // Explicitly return response here
  };
  

  return { data, error, loading, request };
};

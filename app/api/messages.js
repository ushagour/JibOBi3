import client from "./client";
import storage from "../auth/storage";

const endpoint = "/messages";




const getAll = async () => {
  const token = await storage.getToken();
  
  if (!token) return [];

  const response = await client.get(endpoint,
    {
    headers: {
      'Content-Type': 'application/json',
      'x-auth-token': token
    }
  });

  
  return response;
};





const send = async (content, listing_id) => {
  try {

    
    const token = await storage.getToken(); // Retrieve token from AsyncStorage

    
    if (!token) {

      console.error('No token found');
      return;
    }

    const response = await client.post(
      endpoint,
      {
        content:content,
        id: listing_id,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        }
      }
    );

    return response;
    





  } catch (error) {
    console.error("Error sending message:", error);
  }
};
export const deleteMessage = (id) => {

  // console.log(`Sending DELETE request to ${endpoint}/${id}`);
  
  
  return  client.delete(`${endpoint}/${id}`);//remove the / from the endpoint
};

export default {
  send,
  getAll,
  deleteMessage,
};

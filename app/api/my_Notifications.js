import client from "./client";
import storage from "../auth/storage";

const endpoint = "/my_Notifications";




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





const send = async (message, listingId) => {
  try {
    const token = await storage.getToken(); // Retrieve token from AsyncStorage

    
    if (!token) {

      console.error('No token found');
      return;
    }

    const response = await client.post(
      endpoint,
      {
        message,
        listingId,
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
export const delete_notification = (message) => {
  const itemId = message.id;
  // console.log(itemId);

  return  client.delete(`/${endpoint}/${itemId}`);
};

export default {
  send,
  getAll,
  delete_notification,
};

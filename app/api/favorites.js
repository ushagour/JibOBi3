import auth from "./auth";
import client from "./client";


const endpoint = "/favorites";

const getFavorites = (user_id) => client.get(endpoint,{ user_id: user_id }); // Replace with actual user ID when available
const addFavorite = (listingId) => client.post(endpoint, { listing_id: listingId });

const removeFavorite = (listingId) => client.delete(`${endpoint}/${listingId}`);
const getAllFavorites = () => client.get(`${endpoint}/get_all`); // New function to get all favorites for the user

export default {
  getFavorites,
  addFavorite,
  removeFavorite,
  getAllFavorites, // Export the new function
};
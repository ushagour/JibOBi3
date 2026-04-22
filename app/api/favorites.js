import client from "./client";

const endpoint = "/favorites";

const getFavorites = () => client.get(endpoint);
const addFavorite = (listingId) => client.post(endpoint, { listing_id: listingId });

const removeFavorite = (listingId) => client.delete(`${endpoint}/${listingId}`);

export default {
  getFavorites,
  addFavorite,
  removeFavorite,
};
import client from "./client";
const endpoint = "/reviews";

const getReviewsByListing = (listingId) => 
  client.get(`${endpoint}/listing/${listingId}`);

const createReview = (review) => 
  client.post(endpoint, review);

const deleteReview = (reviewId) => 
  client.delete(`${endpoint}/${reviewId}`);

export default {
  getReviewsByListing,
  createReview,
  deleteReview,
};

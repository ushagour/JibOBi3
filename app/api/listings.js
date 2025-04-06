import client from "./client";
const endpoint = "/listings";

const getListings = () => client.get(endpoint);
const getDetailListing = (id) => client.get(`${endpoint}/detail/${id}`);

const getMyListings = (userId) => client.get(`${endpoint}/my_listings?userId=${userId}`);



/**
 * Sends a POST request to the server to add a new listing.
 *
 * @param {object} listing - The listing to be added. It should contain the following fields:
 * - title {string}
 * - price {number}
 * - category {object} - The category of the listing. It should have the following fields:
 *   - label {string}
 *   - value {number}
 * - description {string}
 * - images {array} - An array of URIs of the images of the listing.
 * - location {object} - The location of the listing. It should have the following fields:
 *   - latitude {number}
 *   - longitude {number}
 * @param {function} onUploadProgress - A callback to be called when the upload progress changes.
 * It should take one argument, a number between 0 and 1 that indicates the progress of the upload.
 * @returns {Promise} A Promise that resolves to the response of the server.
 */
export const addListing = (listing,onUploadProgress) => {

  //   /* A new instance of the FormData object is created. 
//    FormData allows you to easily build a set of key-value pairs to send data via HTTP 
//    requests (especially useful for POST requests).
// */
  console.log("Listing Object:", listing);
  


  const data = new FormData();
  data.append("title", listing.title);
  data.append("user_id", listing.user_id);
  data.append("price", listing.price);
  data.append("category_id", listing.category);
  data.append("description", listing.description);

  listing.images.forEach((image, index) => {
    const imageObj = {
      name: `image${index}.png`,
      type: "image/png",
      uri: image,
    }
  
    data.append("images", imageObj);

    // Manually log each image for debugging
    // console.log(`images ${index}:`, imageObj);
});




if (listing.location) {
  data.append("location[latitude]", listing.location.latitude);
  data.append("location[longitude]", listing.location.longitude);
}

 

  return client.post(endpoint, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    onUploadProgress: (progress) =>
      onUploadProgress(progress.loaded / progress.total),//TODO:take a look on this satatement .
  })
  }
  

  export const deleteListing = (id) => {
    console.log(`Sending DELETE request to ${endpoint}/${id}`);

    return client.delete(`${endpoint}/${id}`);
  };
  
  export const updateListing = (listing, listing_id, onUploadProgress) => {
    // console.log("Updated Listing Object:", listing); // Log the updated listing object
  
    const data = new FormData();

  
    data.append("title", listing.title);
    data.append("price", listing.price);
    data.append("category_id", listing.category_id); // Add category_id
    data.append("description", listing.description);
  
    listing.images.forEach((image, index) => {
      const imageObj = {
        name: `image${index}.png`,
        type: "image/png",
        uri: image,
      };
      data.append("images", imageObj);
  
      // Log each image for debugging
      // console.log(`images ${index}:`, imageObj);
    });
  
    if (listing.location) {
      data.append("location[latitude]", listing.location.latitude);
      data.append("location[longitude]", listing.location.longitude);
    }

    console.log(data);
    

  
    return client.put(`${endpoint}/${listing_id}`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progress) =>
        onUploadProgress(progress.loaded / progress.total),
    });
  };



export default {
  addListing,
  getDetailListing,
  getListings,
  getMyListings,
  deleteListing,
  updateListing
};

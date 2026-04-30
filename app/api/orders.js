import client from "./client";

const endpoint = "/orders";

const getOrders = () => client.get(endpoint);

export default {
  getOrders,
};
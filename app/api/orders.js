import client from "./client";

const endpoint = "/orders";

const getOrders = () => client.get(endpoint);
const getRecentOrders = () => client.get(`${endpoint}/recent`);
const getOrderById = (orderId) => client.get(`${endpoint}/${orderId}`);

const createOrder = (orderData) => {
  const payload = {
    ...orderData,
    total_price: orderData.total_price ?? orderData.total_amount,
  };

  return client.post(endpoint, payload);
};

const updateOrderStatus = (orderId, status) =>
  client.put(`${endpoint}/${orderId}/status`, { status });

const deleteOrder = (orderId) => client.delete(`${endpoint}/${orderId}`);

export default {
  getOrders,
  getRecentOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  deleteOrder,
};
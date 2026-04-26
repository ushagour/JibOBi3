import client from "./client";

const endpoint = "/notifications";

const getNotifications = ({ unreadOnly = false, limit = 100 } = {}) =>
  client.get(`${endpoint}?unreadOnly=${unreadOnly}&limit=${limit}`);

const createNotification = ({
  type = "message",
  title,
  content,
  listingId,
} = {}) =>
  client.post(endpoint, {
    type,
    title,
    content,
    listingId,
  });

const markAsRead = (notificationId) => client.patch(`${endpoint}/${notificationId}/read`, {});

const markAllAsRead = () => client.patch(`${endpoint}/read-all`, {});

const updateNotification = (notificationId, payload) =>
  client.patch(`${endpoint}/${notificationId}`, payload);

const deleteNotification = (notificationId) => client.delete(`${endpoint}/${notificationId}`);

export default {
  getNotifications,
  createNotification,
  markAsRead,
  markAllAsRead,
  updateNotification,
  deleteNotification,
};

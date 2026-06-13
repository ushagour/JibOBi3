import client from "./client";

const endpoint = "/messages";

const getConversation = (otherUserId) => client.get(`${endpoint}/conversation/${otherUserId}`);

const getThreads = () => client.get(`${endpoint}/threads`);

const createMessage = ({ recipientId, content, listingId = null } = {}) =>
  client.post(endpoint, {
    recipientId,
    content,
    listingId,
  });

const markAsRead = (messageId) => client.patch(`${endpoint}/${messageId}/read`, {});

export default {
  getConversation,
  getThreads,
  createMessage,
  markAsRead,
};
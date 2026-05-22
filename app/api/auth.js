import client from "./client";

const login = (email, password) => client.post("/auth/login", { email, password });

const register = (userInfo) => client.post("/auth/register", userInfo);

const requestPasswordReset = (email) =>
  client.post("/auth/request-password-reset", { email });

const resetPassword = (email, token, newPassword) =>
  client.post("/auth/reset-password", {
    email,
    token,
    newPassword,
  });


const ChangePassword = (email, currentPassword, newPassword) =>
  client.put("/auth/change-password", {
    email,
    currentPassword,
    newPassword,
  });

export default {
  login,
  register,
  ChangePassword,
  requestPasswordReset,
  resetPassword,
};
  
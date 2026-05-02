import client from "./client";

const login = (email, password) => client.post("/auth/login", { email, password });

const register = (userInfo) => client.post("/auth/register", userInfo);


const ChangePassword = (email, currentPassword, newPassword) =>
  client.put("/auth/change-password", {
    email,
    currentPassword,
    newPassword,
  });

export default {
  login,register,ChangePassword
};
  
import client from "./client";

const login = (email, password) => client.post("/auth/login", { email, password });

const register = (userInfo) => client.post("/auth/register", userInfo);

export default {
  login,register
};
  
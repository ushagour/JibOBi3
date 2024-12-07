import client from "./client";

const register = (userInfo) => client.post("/users", userInfo);

const Edit = (id,userInfo) => client.put(`/users/${id}`, userInfo);

export default { register,Edit };

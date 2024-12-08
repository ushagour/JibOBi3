import client from "./client";


const Edit = (id,userInfo) => client.put(`/users/${id}`, userInfo);


const getUserInfo = (id) => client.get(`/users/${id}`);
export default { Edit,getUserInfo };

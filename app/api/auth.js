import client from "./client";

const login = (email, password) => client.post("/auth/login", { email, password });

const register = (userInfo) => client.post("/auth/register", userInfo);


const ChangePassword = (email, currentPassword, newPassword,onUploadProgress) => { 



  const data = new FormData();

  
  data.append("email",email);
  data.append("currentPassword", currentPassword);
  data.append("newPassword", newPassword); // Add category_id

    return client.put(`/auth/change-password`, data, {
      
      onUploadProgress: (progress) =>
        onUploadProgress(progress.loaded / progress.total),
    });


}

export default {
  login,register,ChangePassword
};
  
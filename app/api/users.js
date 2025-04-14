import client from "./client";




const getUserInfo = (id) => client.get(`/user/${id}`);



const updateUserInfo = (UserData, onUploadProgress) => {  


    console.log("UserData:", UserData); // Debug log
    
    
    const data = new FormData();
    data.append("name", UserData.name);
    data.append("email", UserData.email);
    // data.append("password", UserData.password);
    // data.append("OldPassword", UserData.OldPassword);
    // data.append("avatar", UserData.avatar);
    



    
    return client.put(`/user/${UserData.user_id}`,data  
    , {
        headers: {
            "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progress) =>
            onUploadProgress(progress.loaded / progress.total),
    });
}



const deleteUser = (id) => client.delete(`/user/${id}`);


export default { updateUserInfo,getUserInfo,deleteUser };

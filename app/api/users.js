import client from "./client";




const getUserInfo = (id) => client.get(`/user/${id}`);



const updateUserInfo = (id,UserData, onUploadProgress) => {  

    
    return client.put(`/user/${id}`,UserData  
    , {
        headers: {
            "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progress) =>
            onUploadProgress(progress.loaded / progress.total),
    });
}



const deleteUser = (id) => client.delete(`/user/${id}`);

const deleteUserAvatar = (id) => client.delete(`/user/${id}/avatar`);





export default { updateUserInfo,getUserInfo,deleteUser,deleteUserAvatar };

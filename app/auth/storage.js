import * as SecureStore from "expo-secure-store";
import {jwtDecode} from "jwt-decode";

const key = "authToken";
const profileKey = "authUserProfile";

const storeToken = async (authToken) => {
  try {
    await SecureStore.setItemAsync(key, authToken);
  } catch (error) {
    console.log("Error storing the auth token", error);
  }
};

const getToken = async () => {
  try {
    return await SecureStore.getItemAsync(key);
  } catch (error) {
    console.log("Error getting the auth token", error);
  }
};

const getUser = async () => {
  const token = await getToken();
  if (!token) return null;

  const tokenUser = jwtDecode(token);

  try {
    const profileJson = await SecureStore.getItemAsync(profileKey);
    if (!profileJson) return tokenUser;

    const profileUser = JSON.parse(profileJson);
    return {
      ...tokenUser,
      ...profileUser,
      userId: tokenUser?.userId || profileUser?.userId,
      id: tokenUser?.id || profileUser?.id,
    };
  } catch (error) {
    console.log("Error getting stored user profile", error);
    return tokenUser;
  }
};

const storeUserProfile = async (userProfile) => {
  try {
    if (!userProfile) return;
    await SecureStore.setItemAsync(profileKey, JSON.stringify(userProfile));
  } catch (error) {
    console.log("Error storing user profile", error);
  }
};

const removeUserProfile = async () => {
  try {
    await SecureStore.deleteItemAsync(profileKey);
  } catch (error) {
    console.log("Error removing stored user profile", error);
  }
};

const removeToken = async () => {
  try {
    await SecureStore.deleteItemAsync(key);
    await removeUserProfile();
  } catch (error) {
    console.log("Error removing the auth token", error);
  }
};

export default { getToken, getUser, removeToken, storeToken, storeUserProfile, removeUserProfile };

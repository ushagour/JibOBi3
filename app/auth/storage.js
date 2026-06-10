import * as SecureStore from "expo-secure-store";
import {jwtDecode} from "jwt-decode";

const key = "authToken";
const profileKey = "authUserProfile";
const biometricEnabledKey = "biometricLoginEnabled";
const biometricCredsKey = "biometricLoginCreds";

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

const setBiometricLoginEnabled = async (enabled) => {
  try {
    await SecureStore.setItemAsync(biometricEnabledKey, enabled ? "1" : "0");
  } catch (error) {
    console.log("Error setting biometric login flag", error);
  }
};

const isBiometricLoginEnabled = async () => {
  try {
    const value = await SecureStore.getItemAsync(biometricEnabledKey);
    return value === "1";
  } catch (error) {
    console.log("Error reading biometric login flag", error);
    return false;
  }
};

const storeBiometricCredentials = async ({ email, password }) => {
  try {
    if (!email || !password) return;
    await SecureStore.setItemAsync(
      biometricCredsKey,
      JSON.stringify({ email, password })
    );
  } catch (error) {
    console.log("Error storing biometric credentials", error);
  }
};

const getBiometricCredentials = async () => {
  try {
    const value = await SecureStore.getItemAsync(biometricCredsKey);
    if (!value) return null;
    return JSON.parse(value);
  } catch (error) {
    console.log("Error reading biometric credentials", error);
    return null;
  }
};

const clearBiometricCredentials = async () => {
  try {
    await SecureStore.deleteItemAsync(biometricCredsKey);
  } catch (error) {
    console.log("Error clearing biometric credentials", error);
  }
};

export default {
  getToken,
  getUser,
  removeToken,
  storeToken,
  storeUserProfile,
  removeUserProfile,
  setBiometricLoginEnabled,
  isBiometricLoginEnabled,
  storeBiometricCredentials,
  getBiometricCredentials,
  clearBiometricCredentials,
};

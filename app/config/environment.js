import Constants from "expo-constants";

const getApiUrl = () => {
  const env = process.env.EXPO_PUBLIC_APP_ENV || "prod";

  switch (env) {
    case "dev":
      return process.env.EXPO_PUBLIC_API_URL_DEV;
    case "staging":
      return process.env.EXPO_PUBLIC_API_URL_STAGING;
    case "prod":
      return process.env.EXPO_PUBLIC_API_URL_PROD;
    default:
      return process.env.EXPO_PUBLIC_API_URL_PROD;
  }
};

export const getCurrentSettings = () => {
  const apiUrl = getApiUrl();
  if (__DEV__) {
    console.log(`Environment: ${process.env.EXPO_PUBLIC_APP_ENV}, API URL: ${apiUrl}`);
  }
  return { apiUrl };
};

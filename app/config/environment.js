import Constants from "expo-constants";

const getApiUrl = () => {
  // Priority 1: Environment variables (from eas.json)
  const env = process.env.EXPO_PUBLIC_APP_ENV || "prod";
  let apiUrl;

  switch (env) {
    case "dev":
      apiUrl = process.env.EXPO_PUBLIC_API_URL_DEV;
      break;
    case "staging":
      apiUrl = process.env.EXPO_PUBLIC_API_URL_STAGING;
      break;
    case "prod":
      apiUrl = process.env.EXPO_PUBLIC_API_URL_PROD;
      break;
    default:
      apiUrl = process.env.EXPO_PUBLIC_API_URL_PROD;
  }

  // Priority 2: Fallback to app.json extra config
  if (!apiUrl && Constants.expoConfig?.extra?.apiUrl) {
    apiUrl = Constants.expoConfig.extra.apiUrl;
  }

  // Priority 3: Hardcoded production URL (last resort)
  if (!apiUrl) {
    apiUrl = "https://jibobi3.bonto.run/api";
  }

  return apiUrl;
};

export const getCurrentSettings = () => {
  const apiUrl = getApiUrl();
  const env = process.env.EXPO_PUBLIC_APP_ENV || "prod";

  if (__DEV__) {
    console.log("\n=== API CONFIG ===");
    console.log("Environment:", env);
    console.log("API URL:", apiUrl);
    console.log("==================\n");
  }

  return {
    apiUrl,
    env,
    isDevelopment: __DEV__,
  };
};

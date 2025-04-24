import Constants from "expo-constants";

const settings = {
  dev: {
    apiUrl: "http://192.168.0.176:9000/api",
  },
  staging: {
    apiUrl: "https://staging.example.com/api", // Staging server
  },
  prod: {
    apiUrl: "https://api.example.com", // Production server
  },
};

export const getCurrentSettings = () => {
  if (__DEV__) return settings.dev;

  const releaseChannel = Constants.manifest?.releaseChannel || "prod";

  if (releaseChannel === "staging") return settings.staging;

  return settings.prod;
};
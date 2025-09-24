import Constants from "expo-constants";

const settings = {
  dev: {
    // apiUrl: "https://jib-o-bi3-backend-production.up.railway.app/api",
        apiUrl: "http://192.168.1.206:3000/api", // dev server

  },
  staging: {
    apiUrl: "http://192.168.1.206:3000/api", // Staging server
  },
  prod: {
    apiUrl: "https://jib-o-bi3-backend-production.up.railway.app/api", // Production server
  },
};

export const getCurrentSettings = () => {
  // Check if the app is running in development mode
  if (__DEV__) {
    console.log("Environment: Development");
    return settings.dev;
  }

  // Get the release channel from Expo Constants
  const releaseChannel = Constants.manifest?.releaseChannel || "prod";

  // Determine the environment based on the release channel
  switch (releaseChannel) {
    case "development":
      console.log("Environment: Development");
      return settings.dev;
    case "staging":
      console.log("Environment: Staging");
      return settings.staging;
    case "production":
      console.log("Environment: Production");
      return settings.prod;
    default:
      console.log("Environment: Production");
      return settings.prod;
  }
};

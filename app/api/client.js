import axios from "axios";
import cache from "../utility/cache";
import authStorage from "../auth/storage";
import { getCurrentSettings } from "../config/environment";

const { apiUrl } = getCurrentSettings();

const apiClient = axios.create({
  baseURL: apiUrl,
  timeout: 10000,
});

// Add auth token to each request if available
apiClient.interceptors.request.use(
  async (config) => {
    const authToken = await authStorage.getToken();
    if (authToken) {
      config.headers["x-auth-token"] = authToken;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Custom GET with caching
const originalGet = apiClient.get.bind(apiClient);
apiClient.get = async (url, config) => {
  try {
    const response = await originalGet(url, config);
    if (response.status >= 200 && response.status < 300) {
      cache.store(url, response.data);
      return { ok: true, data: response.data };
    }
    const data = await cache.get(url);
    return data ? { ok: true, data } : { ok: false, data: null };
  } catch (error) {
    const data = await cache.get(url);
    return data ? { ok: true, data } : { ok: false, error };
  }
};
// Custom POST
const originalPost = apiClient.post.bind(apiClient);
apiClient.post = async (url, data, config) => {
  try {
    const response = await originalPost(url, data, config);
    if (response.status >= 200 && response.status < 300) {
      return { ok: true, data: response.data };
    }
    return { ok: false, data: null };
  } catch (error) {
    return { ok: false, error };
  }
};
// Custom PUT
const originalPut = apiClient.put.bind(apiClient);  
apiClient.put = async (url, data, config) => {
  try {
    const response = await originalPut(url, data, config);
    if (response.status >= 200 && response.status < 300) {
      return { ok: true, data: response.data };
    }
    return { ok: false, data: null };
  } catch (error) {
    return { ok: false, error };
  }
}
// Custom DELETE
const originalDelete = apiClient.delete.bind(apiClient);
apiClient.delete = async (url, config) => {
  try {
    const response = await originalDelete(url, config);
    if (response.status >= 200 && response.status < 300) {
      return { ok: true, data: response.data };
    }
    return { ok: false, data: null };
  } catch (error) {
    return { ok: false, error };
  }
};

export default apiClient;

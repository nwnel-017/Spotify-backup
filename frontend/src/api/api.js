import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
  withCredentials: true, // important for sending cookies
});

// Simple flag to prevent refresh loops
let isRefreshing = false;

api.interceptors.response.use(
  (response) => response, // pass successful responses straight through
  async (error) => {
    const originalRequest = error.config;

    // If unauthorized and we haven’t retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;
        try {
          console.log("Refreshing access token...");
          await axios.get(
            `${process.env.REACT_APP_API_BASE_URL}/auth/refreshToken`,
            { withCredentials: true }
          );
          console.log("Token refreshed successfully!");
        } catch (refreshError) {
          console.error("Token refresh failed:", refreshError);
          isRefreshing = false;
          // Optionally redirect to login if refresh fails
          window.location.href = "/";
          return Promise.reject(refreshError);
        }
        isRefreshing = false;
      }

      // Retry the original request with the new token
      return api(originalRequest);
    }

    // If not 401 or retry already attempted, just reject
    return Promise.reject(error);
  }
);

export default api;

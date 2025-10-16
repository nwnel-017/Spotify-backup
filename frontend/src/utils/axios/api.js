import axios from "axios";

const api = axios.create({
  baseURL: `${process.env.REACT_APP_API_BASE_URL}`,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      console.log(
        "api call failed with 401. attempting to make request to /refreshToken!"
      );
      try {
        // Call your refresh token endpoint
        await api.get("/auth/refreshToken"); // HTTP-only cookie is sent automatically

        // Retry the original request after refreshing
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed — logout user or redirect to login
        console.error("Token refresh failed:", refreshError);
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

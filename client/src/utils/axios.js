import axios from "axios";
import { useAuthStore } from "../store/AuthStore";

const api = axios.create({
  baseURL: "http://localhost:8000/",
  withCredentials: true, // Always send cookies with requests
});

// Response interceptor - handles token expiration and authentication errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle authentication errors - but only redirect for auth-related endpoints
    if (error.response?.status === 401) {
      // 401 usually means token expired or invalid - always redirect
      const { clearAuth } = useAuthStore.getState();
      clearAuth();

      // Only redirect if not already on login page
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    } else if (error.response?.status === 403) {
      // 403 could be permission denied OR token invalid
      // Only redirect if it's an auth-related endpoint (like /auth/me)
      const isAuthEndpoint = error.config?.url?.includes("/auth/");

      if (isAuthEndpoint) {
        const { clearAuth } = useAuthStore.getState();
        clearAuth();

        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }
      // For non-auth endpoints, let the component handle the 403 error
    }
    return Promise.reject(error);
  }
);

export default api;

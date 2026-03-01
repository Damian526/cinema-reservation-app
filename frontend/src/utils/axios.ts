import axios from "axios";
import { isAxiosError } from "axios";
import { useAuthStore } from "../stores/auth";
import router from "../router";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:3000",
  withCredentials: true, // send HttpOnly cookie on every request
});

// Response interceptor — handle 401 (cookie expired or missing)
api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (!isAxiosError(error)) {
      return Promise.reject(error);
    }

    const status = error.response?.status;
    const requestUrl = error.config?.url ?? "";
    const isAuthFlowRequest =
      requestUrl.includes("/auth/login") ||
      requestUrl.includes("/auth/admin-login") ||
      requestUrl.includes("/auth/profile");

    if (status === 401 && !isAuthFlowRequest) {
      const authStore = useAuthStore();
      authStore.clearSession();
      authStore.sessionInitialized = true;

      const currentPath = router.currentRoute.value.path;
      const redirectPath = currentPath.startsWith("/admin") ? "/admin/login" : "/login";
      if (currentPath !== redirectPath) {
        router.push(redirectPath);
      }

      console.warn('Session expired. Please log in again.');
      error.message = 'Your session has expired. Please log in again.';
    }
    return Promise.reject(error);
  }
);

export default api;

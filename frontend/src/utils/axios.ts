import axios from "axios";
import { useAuthStore } from "../stores/auth";
import router from "../router";

const api = axios.create({
  baseURL: "http://localhost:3000",
  withCredentials: true, // send HttpOnly cookie on every request
});

// Response interceptor — handle 401 (cookie expired or missing)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const authStore = useAuthStore();
      authStore.clearSession();
      router.push('/login');
      console.warn('Session expired. Please log in again.');
      error.message = 'Your session has expired. Please log in again.';
    }
    return Promise.reject(error);
  }
);

export default api;

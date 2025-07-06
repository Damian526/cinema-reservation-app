import axios from "axios";
import { useAuthStore } from "../stores/auth";
import router from "../router";

const api = axios.create({ baseURL: "http://localhost:3000" });

api.interceptors.request.use((config) => {
  const auth = useAuthStore();
  
  if (auth.token) {
    config.headers.Authorization = `Bearer ${auth.token}`;
  }
  
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If we get 401 Unauthorized, the token might be expired
    if (error.response?.status === 401) {
      // Clear the token from localStorage
      localStorage.removeItem("token");
      
      // Clear auth store
      const authStore = useAuthStore();
      authStore.logout();
      
      // Redirect to login page
      router.push('/login');
      
      // Optional: Show a notification
      // You can also use a toast library here
      console.warn('Session expired. Please log in again.');
      
      // Modify error message for better UX
      error.message = 'Your session has expired. Please log in again.';
    }
    
    return Promise.reject(error);
  }
);

export default api;

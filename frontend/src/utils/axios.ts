import axios from "axios";
import { useAuthStore } from "../stores/auth";

const api = axios.create({ baseURL: "http://localhost:3000" });

api.interceptors.request.use((config) => {
  const auth = useAuthStore();
  
  // Debug logging
  console.log("🔍 Axios Request Interceptor:");
  console.log("  - Auth store state:", {
    token: auth.token ? `${auth.token.substring(0, 20)}...` : null,
    user: auth.user,
    isAuth: auth.isAuth
  });
  console.log("  - Request URL:", config.url);
  console.log("  - Request method:", config.method?.toUpperCase());
  
  if (auth.token) {
    config.headers.Authorization = `Bearer ${auth.token}`;
    console.log("  ✅ Authorization header added");
  } else {
    console.log("  ❌ No token found - request will be unauthorized");
  }
  
  console.log("  - Final headers:", config.headers);
  return config;
});

// Response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log("✅ API Response Success:", {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.log("❌ API Response Error:", {
      url: error.config?.url,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });

    // If we get 401 Unauthorized, the token might be expired
    if (error.response?.status === 401) {
      console.log("🚨 401 Unauthorized - Token might be expired. Please login again.");
      // Clear the token from localStorage
      localStorage.removeItem("token");
      // Redirect to login or show login modal
      // You might want to emit an event or redirect here
    }
    
    return Promise.reject(error);
  }
);

export default api;

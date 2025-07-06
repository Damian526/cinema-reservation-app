import { defineStore } from "pinia";
import api from "../utils/axios";

// Helper function to decode JWT token
function decodeJWT(token: string) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Failed to decode JWT:", error);
    return null;
  }
}

// Helper function to check if token is expired
function isTokenExpired(token: string): boolean {
  const decoded = decodeJWT(token);
  if (!decoded || !decoded.exp) return true;

  const currentTime = Math.floor(Date.now() / 1000);
  return decoded.exp < currentTime;
}

export const useAuthStore = defineStore("auth", {
  state: () => ({
    token: localStorage.getItem("token") || "",
    user: null as null | { email: string; role: string },
  }),
  getters: {
    isAuth: (s) => {
      if (!s.token) return false;
      
      // Check if token is expired
      if (isTokenExpired(s.token)) {
        console.log("🚨 Token is expired, logging out");
        // Clear expired token
        localStorage.removeItem("token");
        s.token = "";
        s.user = null;
        return false;
      }
      
      return true;
    },
  },
  actions: {
    setToken(token: string) {
      this.token = token;
      token
        ? localStorage.setItem("token", token)
        : localStorage.removeItem("token");
    },
    setUser(user: any | null) {
      this.user = user;
    },
    async login(credentials: { email: string; password: string }) {
      const { data } = await api.post("/auth/login", credentials);
      console.log("Login response:", data);
      this.setToken(data.access_token);
      this.setUser(data.user);
    },
    logout() {
      this.setToken("");
      this.setUser(null);
    },
  },
});

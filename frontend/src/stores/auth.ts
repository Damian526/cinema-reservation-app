import { defineStore } from "pinia";
import api from "../utils/axios";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    token: localStorage.getItem("token") || "",
    user: null as null | { email: string; role: string },
  }),
  getters: {
    isAuth: (s) => !!s.token,
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

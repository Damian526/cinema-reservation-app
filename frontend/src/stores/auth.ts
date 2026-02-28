import { defineStore } from "pinia";
import api from "../utils/axios";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null as null | { id: number; username: string; email: string; role: string; createdAt: string },
  }),
  getters: {
    // Token lives in an HttpOnly cookie — we derive auth state from user object only
    isAuth: (s) => s.user !== null,
  },
  actions: {
    setUser(user: any | null) {
      this.user = user;
    },
    clearSession() {
      this.user = null;
    },
    async login(credentials: { email: string; password: string }) {
      const { data } = await api.post("/auth/login", credentials);
      this.setUser(data.user);
    },
    async adminLogin(credentials: { email: string; password: string }) {
      const { data } = await api.post("/auth/admin-login", credentials);
      this.setUser(data.user);
    },
    async logout() {
      await api.post("/auth/logout").catch(() => null); // ignore errors
      this.clearSession();
    },
    async fetchProfile() {
      const { data } = await api.get("/auth/profile");
      this.setUser(data.user);
      return data.user;
    },
    async updateProfile(profileData: { username?: string; email?: string }) {
      const { data } = await api.put("/auth/profile", profileData);
      this.setUser(data.user);
      return data;
    },
    async changePassword(passwordData: { currentPassword: string; newPassword: string }) {
      const { data } = await api.put("/auth/change-password", passwordData);
      return data;
    },
    // Call on app startup to restore session from cookie
    async initSession() {
      try {
        await this.fetchProfile();
      } catch {
        this.clearSession();
      }
    },
  },
});

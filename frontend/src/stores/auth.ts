import { defineStore } from "pinia";
import { isAxiosError } from "axios";
import api from "../utils/axios";

let initSessionPromise: Promise<void> | null = null;
let fetchProfileController: AbortController | null = null;

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  role: "user" | "admin";
  createdAt: string;
}

function isAuthUser(value: unknown): value is AuthUser {
  if (!value || typeof value !== "object") return false;
  const user = value as Record<string, unknown>;
  return (
    typeof user.id === "number" &&
    Number.isFinite(user.id) &&
    typeof user.username === "string" &&
    user.username.length > 0 &&
    typeof user.email === "string" &&
    user.email.includes("@") &&
    (user.role === "user" || user.role === "admin") &&
    typeof user.createdAt === "string" &&
    user.createdAt.length > 0
  );
}

function isRequestCanceled(error: unknown): boolean {
  return isAxiosError(error) && error.code === "ERR_CANCELED";
}

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null as AuthUser | null,
    sessionInitialized: false,
  }),
  getters: {
    // Token lives in an HttpOnly cookie — we derive auth state from user object only
    isAuth: (s) => s.user !== null,
  },
  actions: {
    setUser(user: unknown | null) {
      if (user === null) {
        this.user = null;
        return;
      }

      if (!isAuthUser(user)) {
        this.user = null;
        throw new Error("Invalid user payload from server");
      }

      this.user = user;
    },
    clearSession() {
      this.user = null;
    },
    async login(credentials: { email: string; password: string }) {
      const { data } = await api.post("/auth/login", credentials);
      this.setUser(data.user);
      this.sessionInitialized = true;
    },
    async adminLogin(credentials: { email: string; password: string }) {
      const { data } = await api.post("/auth/admin-login", credentials);
      this.setUser(data.user);
      this.sessionInitialized = true;
    },
    async logout() {
      await api.post("/auth/logout").catch(() => null); // ignore errors
      this.clearSession();
      this.sessionInitialized = true;
    },
    async fetchProfile() {
      fetchProfileController?.abort();
      const controller = new AbortController();
      fetchProfileController = controller;

      try {
        const { data } = await api.get("/auth/profile", {
          signal: controller.signal,
        });
        this.setUser(data.user);
        this.sessionInitialized = true;
        return data.user;
      } catch (error) {
        if (isRequestCanceled(error)) return this.user;
        throw error;
      }
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
      if (this.sessionInitialized) return;
      if (!initSessionPromise) {
        initSessionPromise = (async () => {
          try {
            await this.fetchProfile();
          } catch {
            this.clearSession();
          } finally {
            this.sessionInitialized = true;
            initSessionPromise = null;
          }
        })();
      }
      await initSessionPromise;
    },
  },
});

import { defineStore } from "pinia";
import api from "../utils/axios";
import type { Session, CreateSessionPayload, UpdateSessionPayload, SessionsQueryParams, PaginatedSessions } from '../types/session';

export type { Session };

export const useSessionStore = defineStore("sessions", {
  state: () => ({
    list: [] as Session[],
    loading: false,
    error: null as string | null,
    // admin state
    adminSessions: [] as Session[],
    adminTotal: 0,
    adminLoading: false,
  }),
  actions: {
    /* ── user-facing ── */
    async fetchAll() {
      this.loading = true;
      this.error = null;
      try {
        const resp = await api.get("/sessions");
        this.list = resp.data;
      } catch (error) {
        this.error = "Failed to fetch sessions";
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /* ── admin ── */
    async adminFetchSessions(params: SessionsQueryParams = {}): Promise<PaginatedSessions> {
      this.adminLoading = true;
      try {
        const { data } = await api.get<PaginatedSessions>('/admin/sessions', { params });
        this.adminSessions = data.data;
        this.adminTotal = data.total;
        return data;
      } finally {
        this.adminLoading = false;
      }
    },

    async adminFetchSession(id: number): Promise<Session> {
      const { data } = await api.get<Session>(`/admin/sessions/${id}`);
      return data;
    },

    async adminCreateSession(payload: CreateSessionPayload): Promise<Session> {
      const { data } = await api.post<Session>('/admin/sessions', payload);
      return data;
    },

    async adminUpdateSession(id: number, payload: UpdateSessionPayload): Promise<Session> {
      const { data } = await api.patch<Session>(`/admin/sessions/${id}`, payload);
      return data;
    },

    async adminDeleteSession(id: number): Promise<void> {
      await api.delete(`/admin/sessions/${id}`);
      this.adminSessions = this.adminSessions.filter(s => s.id !== id);
      this.adminTotal = Math.max(0, this.adminTotal - 1);
    },
  },
});

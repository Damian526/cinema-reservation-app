import { defineStore } from "pinia";
import { isAxiosError } from "axios";
import api from "../utils/axios";
import type { Session, CreateSessionPayload, UpdateSessionPayload, SessionsQueryParams, PaginatedSessions } from '../types/session';

export type { Session };

let fetchAllController: AbortController | null = null;
let adminFetchSessionsController: AbortController | null = null;
let adminFetchSessionController: AbortController | null = null;

function isRequestCanceled(error: unknown): boolean {
  return isAxiosError(error) && error.code === "ERR_CANCELED";
}

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
      fetchAllController?.abort();
      const controller = new AbortController();
      fetchAllController = controller;

      this.loading = true;
      this.error = null;
      try {
        const resp = await api.get("/sessions", { signal: controller.signal });
        this.list = resp.data;
      } catch (error) {
        if (isRequestCanceled(error)) return;
        this.error = "Failed to fetch sessions";
        throw error;
      } finally {
        if (fetchAllController !== controller) return;
        this.loading = false;
      }
    },

    /* ── admin ── */
    async adminFetchSessions(params: SessionsQueryParams = {}): Promise<PaginatedSessions> {
      adminFetchSessionsController?.abort();
      const controller = new AbortController();
      adminFetchSessionsController = controller;

      this.adminLoading = true;
      try {
        const { data } = await api.get<PaginatedSessions>('/admin/sessions', {
          params,
          signal: controller.signal,
        });
        this.adminSessions = data.data;
        this.adminTotal = data.total;
        return data;
      } catch (error) {
        if (isRequestCanceled(error)) {
          return { data: this.adminSessions, total: this.adminTotal };
        }
        throw error;
      } finally {
        if (adminFetchSessionsController === controller) {
          this.adminLoading = false;
        }
      }
    },

    async adminFetchSession(id: number): Promise<Session> {
      adminFetchSessionController?.abort();
      const controller = new AbortController();
      adminFetchSessionController = controller;

      const { data } = await api.get<Session>(`/admin/sessions/${id}`, {
        signal: controller.signal,
      });
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

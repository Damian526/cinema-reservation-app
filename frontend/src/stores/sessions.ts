import { defineStore } from "pinia";
import axios from "../utils/axios";

interface Session {
  id: number;
  movieTitle: string;
  description?: string;
  startTime: string;
  endTime: string;
  totalSeats: number;
  availableSeats: number;
  price: number;
  roomNumber: number;
  version: number;
}

export const useSessionStore = defineStore("sessions", {
  state: () => ({
    list: [] as Session[],
    loading: false,
    error: null as string | null,
  }),
  actions: {
    async fetchAll() {
      this.loading = true;
      this.error = null;
      try {
        const resp = await axios.get("/sessions");
        this.list = resp.data;
        console.log("Sessions loaded:", resp.data); // Debug log
      } catch (error) {
        this.error = "Failed to fetch sessions";
        console.error("Error fetching sessions:", error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
  },
});

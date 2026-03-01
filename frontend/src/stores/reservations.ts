import { defineStore } from "pinia";
import { isAxiosError } from "axios";
import api from "../utils/axios";
import type { AuthUser } from "./auth";

interface Reservation {
  id: number;
  sessionId?: number;
  seatsBooked: number;
  seatNumbers?: number[];
  reservedAt: string;
  user?: AuthUser;
  session?: {
    id: number;
    movieTitle: string;
    description?: string;
    startTime: string;
    endTime: string;
    totalSeats: number;
    availableSeats: number;
    price: number;
    roomNumber: number;
  };
}

interface CreateReservationData {
  sessionId: number;
  seatsBooked: number;
  seatNumbers: number[];
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (Array.isArray(message)) return message.join(", ");
    if (typeof message === "string") return message;
  }
  return fallback;
}

export const useReservationStore = defineStore("reservations", {
  state: () => ({
    mine: [] as Reservation[],
    loading: false,
    error: null as string | null,
  }),
  actions: {
    async fetchMine() {
      this.loading = true;
      this.error = null;
      try {
        const resp = await api.get("/reservations/my");
        this.mine = resp.data;
      } catch (error: unknown) {
        this.error = getErrorMessage(error, "Failed to fetch reservations");
        console.error('Failed to fetch reservations:', error);
      } finally {
        this.loading = false;
      }
    },

    async createReservation(reservationData: CreateReservationData) {
      this.loading = true;
      this.error = null;
      try {
        const resp = await api.post("/reservations", reservationData);
        // Refresh the user's reservations after creating a new one
        await this.fetchMine();
        return resp.data;
      } catch (error: unknown) {
        this.error = getErrorMessage(error, "Failed to create reservation");
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async cancelReservation(reservationId: number) {
      this.loading = true;
      this.error = null;
      try {
        await api.patch(`/reservations/${reservationId}/cancel`);
        // Refresh the user's reservations after canceling
        await this.fetchMine();
      } catch (error: unknown) {
        this.error = getErrorMessage(error, "Failed to cancel reservation");
        console.error('Failed to cancel reservation:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async modifyReservation(reservationId: number, seatNumbers: number[]) {
      this.loading = true;
      this.error = null;
      try {
        await api.patch(`/reservations/${reservationId}/modify`, {
          seatNumbers
        });
        // Refresh the user's reservations after modifying
        await this.fetchMine();
      } catch (error: unknown) {
        this.error = getErrorMessage(error, "Failed to modify reservation");
        console.error('Failed to modify reservation:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async getReservationDetails(reservationId: number) {
      this.loading = true;
      this.error = null;
      try {
        const resp = await api.get(`/reservations/${reservationId}/details`);
        return resp.data;
      } catch (error: unknown) {
        this.error = getErrorMessage(error, "Failed to fetch reservation details");
        console.error('Failed to fetch reservation details:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // Legacy method for backward compatibility
    async book(sessionId: number, seats: number) {
      // This method is kept for backward compatibility but should use seatNumbers
      const seatNumbers = Array.from({ length: seats }, (_, i) => i + 1);
      return this.createReservation({
        sessionId,
        seatsBooked: seats,
        seatNumbers
      });
    },
  },
});

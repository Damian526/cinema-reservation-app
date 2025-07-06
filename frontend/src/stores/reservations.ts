import { defineStore } from "pinia";
import axios from "../utils/axios";

interface Reservation {
  id: number;
  sessionId: number;
  seatsCount: number;
  seatNumbers?: number[];
  customerName: string;
  customerEmail: string;
  totalPrice: number;
  reservationDate: string;
  status: 'confirmed' | 'cancelled';
}

interface CreateReservationData {
  sessionId: number;
  seatsCount: number;
  seatNumbers: number[];
  customerName: string;
  customerEmail: string;
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
        const resp = await axios.get("/reservations/my");
        this.mine = resp.data;
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Failed to fetch reservations';
        console.error('Failed to fetch reservations:', error);
      } finally {
        this.loading = false;
      }
    },

    async createReservation(reservationData: CreateReservationData) {
      this.loading = true;
      this.error = null;
      try {
        const resp = await axios.post("/reservations", reservationData);
        // Refresh the user's reservations after creating a new one
        await this.fetchMine();
        return resp.data;
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Failed to create reservation';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async cancelReservation(reservationId: number) {
      this.loading = true;
      this.error = null;
      try {
        await axios.patch(`/reservations/${reservationId}/cancel`);
        // Refresh the user's reservations after canceling
        await this.fetchMine();
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Failed to cancel reservation';
        console.error('Failed to cancel reservation:', error);
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
        seatsCount: seats,
        seatNumbers,
        customerName: 'Current User',
        customerEmail: 'user@example.com'
      });
    },
  },
});

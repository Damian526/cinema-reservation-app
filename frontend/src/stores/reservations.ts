import { defineStore } from "pinia";
import { ref } from "vue";
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

interface CancelReservationData {
  expectedVersion?: number;
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (Array.isArray(message)) return message.join(", ");
    if (typeof message === "string") return message;
  }
  return fallback;
}

export const useReservationStore = defineStore("reservations", () => {
  const mine = ref<Reservation[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchMine() {
    loading.value = true;
    error.value = null;
    try {
      const resp = await api.get("/reservations/my");
      mine.value = resp.data;
    } catch (e: unknown) {
      error.value = getErrorMessage(e, "Failed to fetch reservations");
      console.error("Failed to fetch reservations:", e);
    } finally {
      loading.value = false;
    }
  }

  async function createReservation(reservationData: CreateReservationData) {
    loading.value = true;
    error.value = null;
    try {
      const resp = await api.post("/reservations", reservationData);
      await fetchMine();
      return resp.data;
    } catch (e: unknown) {
      error.value = getErrorMessage(e, "Failed to create reservation");
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function cancelReservation(
    reservationId: number,
    cancelData: CancelReservationData = {},
  ) {
    loading.value = true;
    error.value = null;
    try {
      await api.post(`/reservations/${reservationId}/cancel`, cancelData);
      await fetchMine();
    } catch (e: unknown) {
      error.value = getErrorMessage(e, "Failed to cancel reservation");
      console.error("Failed to cancel reservation:", e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function modifyReservation(reservationId: number, seatNumbers: number[]) {
    loading.value = true;
    error.value = null;
    try {
      await api.patch(`/reservations/${reservationId}/modify`, {
        seatNumbers,
      });
      await fetchMine();
    } catch (e: unknown) {
      error.value = getErrorMessage(e, "Failed to modify reservation");
      console.error("Failed to modify reservation:", e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function getReservationDetails(reservationId: number) {
    loading.value = true;
    error.value = null;
    try {
      const resp = await api.get(`/reservations/${reservationId}/details`);
      return resp.data;
    } catch (e: unknown) {
      error.value = getErrorMessage(e, "Failed to fetch reservation details");
      console.error("Failed to fetch reservation details:", e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  return {
    mine,
    loading,
    error,
    fetchMine,
    createReservation,
    cancelReservation,
    modifyReservation,
    getReservationDetails,
  };
});

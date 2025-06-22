import { defineStore } from "pinia";
import axios from "../utils/axios";

export const useReservationStore = defineStore("reservations", {
  state: () => ({
    mine: [] as Array<{
      id: number;
      sessionId: number;
      seatsBooked: number;
      reservedAt: string;
    }>,
  }),
  actions: {
    async fetchMine() {
      const resp = await axios.get("/reservations");
      this.mine = resp.data;
    },
    async book(sessionId: number, seats: number) {
      await axios.post("/reservations", { sessionId, seatsBooked: seats });
    },
  },
});

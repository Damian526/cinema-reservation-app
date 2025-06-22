import { defineStore } from 'pinia';
import axios from '../utils/axios';

export const useSessionStore = defineStore('sessions', {
  state: () => ({
    list: [] as Array<{ id: number; movieTitle: string; startTime: string; availableSeats: number }>,
  }),
  actions: {
    async fetchAll() {
      const resp = await axios.get('/sessions');
      this.list = resp.data;
    },
  },
});

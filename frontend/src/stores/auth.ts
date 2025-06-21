import { defineStore } from 'pinia';
import axios from '../utils/axios';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    user: null as null | { email: string; role: string },
  }),
  getters: {
    isAuth: (s) => !!s.token,
  },
  actions: {
    async login(credentials: { email: string; password: string }) {
      const { data } = await axios.post('/auth/login', credentials);
      this.token = data.access_token;
      localStorage.setItem('token', this.token);
      this.user = data.user;
    },
    logout() {
      this.token = '';
      this.user = null;
      localStorage.removeItem('token');
    },
  },
});

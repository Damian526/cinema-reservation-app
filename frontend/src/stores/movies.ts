import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '../utils/axios';
import type {
  Movie,
  CreateMoviePayload,
  UpdateMoviePayload,
  MoviesQueryParams,
  PaginatedResponse,
} from '../types/movie';

export const useMoviesStore = defineStore('movies', () => {
  const movies = ref<Movie[]>([]);
  const currentMovie = ref<Movie | null>(null);
  const total = ref(0);
  const currentPage = ref(1);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  function setError(e: unknown) {
    error.value =
      e instanceof Error ? e.message : 'An unexpected error occurred';
  }

  async function fetchMovies(params: MoviesQueryParams = {}) {
    isLoading.value = true;
    error.value = null;
    try {
      const { data } = await api.get<PaginatedResponse<Movie>>(
        '/admin/movies',
        { params },
      );
      movies.value = data.data;
      total.value = data.total;
      currentPage.value = data.page;
    } catch (e) {
      setError(e);
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchMovie(id: number) {
    isLoading.value = true;
    error.value = null;
    try {
      const { data } = await api.get<Movie>(`/admin/movies/${id}`);
      currentMovie.value = data;
    } catch (e) {
      setError(e);
    } finally {
      isLoading.value = false;
    }
  }

  async function createMovie(payload: CreateMoviePayload): Promise<Movie> {
    isLoading.value = true;
    error.value = null;
    try {
      const { data } = await api.post<Movie>('/admin/movies', payload);
      movies.value.unshift(data);
      total.value++;
      return data;
    } catch (e) {
      setError(e);
      throw e;
    } finally {
      isLoading.value = false;
    }
  }

  async function updateMovie(
    id: number,
    payload: UpdateMoviePayload,
  ): Promise<Movie> {
    isLoading.value = true;
    error.value = null;
    try {
      const { data } = await api.patch<Movie>(`/admin/movies/${id}`, payload);
      const idx = movies.value.findIndex((m) => m.id === id);
      if (idx !== -1) movies.value[idx] = data;
      currentMovie.value = data;
      return data;
    } catch (e) {
      setError(e);
      throw e;
    } finally {
      isLoading.value = false;
    }
  }

  async function deleteMovie(id: number): Promise<void> {
    isLoading.value = true;
    error.value = null;
    try {
      await api.delete(`/admin/movies/${id}`);
      movies.value = movies.value.filter((m) => m.id !== id);
      total.value--;
    } catch (e) {
      setError(e);
      throw e;
    } finally {
      isLoading.value = false;
    }
  }

  function clearCurrentMovie() {
    currentMovie.value = null;
  }

  return {
    movies,
    currentMovie,
    total,
    currentPage,
    isLoading,
    error,
    fetchMovies,
    fetchMovie,
    createMovie,
    updateMovie,
    deleteMovie,
    clearCurrentMovie,
  };
});

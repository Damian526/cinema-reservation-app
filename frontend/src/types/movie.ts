export interface Movie {
  id: number;
  title: string;
  description: string | null;
  durationMinutes: number;
  genre: string;
  director: string;
  posterUrl: string | null;
  releaseYear: number;
  createdAt: string;
  updatedAt: string;
}

export type CreateMoviePayload = Omit<Movie, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateMoviePayload = Partial<CreateMoviePayload>;

export interface MoviesQueryParams {
  search?: string;
  genre?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export const MOVIE_GENRES = [
  'Action',
  'Adventure',
  'Animation',
  'Comedy',
  'Crime',
  'Documentary',
  'Drama',
  'Fantasy',
  'Horror',
  'Musical',
  'Mystery',
  'Romance',
  'Sci-Fi',
  'Thriller',
  'Western',
] as const;

export type MovieGenre = (typeof MOVIE_GENRES)[number];

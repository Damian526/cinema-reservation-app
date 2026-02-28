import type { Movie } from './movie';

export interface Session {
  id: number;
  movieTitle: string;
  description?: string | null;
  startTime: string;
  endTime: string;
  totalSeats: number;
  availableSeats: number;
  price: number;
  roomNumber: number;
  version: number;
  movieId?: number | null;
  movie?: Movie | null;
}

export interface CreateSessionPayload {
  movieId?: number | null;
  movieTitle: string;
  description?: string;
  startTime: string; // ISO string
  endTime: string;   // ISO string
  totalSeats: number;
  price: number;
  roomNumber: number;
}

export interface UpdateSessionPayload {
  movieId?: number | null;
  movieTitle?: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  totalSeats?: number;
  availableSeats?: number;
  price?: number;
  roomNumber?: number;
}

export interface SessionsQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  movieId?: number;
  dateFrom?: string;
  dateTo?: string;
}

export interface PaginatedSessions {
  data: Session[];
  total: number;
}

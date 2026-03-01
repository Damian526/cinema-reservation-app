import type { AuthUser } from "../stores/auth";

export type ReservationStatus =
  | "active"
  | "upcoming"
  | "completed"
  | "cancelled"
  | "unknown";

export interface ReservationSession {
  id: number;
  movieTitle: string;
  description?: string;
  startTime: string;
  endTime: string;
  totalSeats: number;
  availableSeats: number;
  price: number;
  roomNumber: number;
}

export interface Reservation {
  id: number;
  sessionId?: number;
  seatsBooked: number;
  seatNumbers?: number[];
  reservedAt: string;
  version?: number;
  user?: AuthUser;
  session?: ReservationSession;
}

export interface ReservationWithStatus extends Reservation {
  status: ReservationStatus;
}

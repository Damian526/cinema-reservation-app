import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { SessionsService } from '../sessions/sessions.service';

export interface CreateReservationDto {
  sessionId: number;
  userId: number;
  seatsCount: number;
  customerName: string;
  customerEmail: string;
}

export interface Reservation {
  id: number;
  sessionId: number;
  userId: number;
  seatsCount: number;
  customerName: string;
  customerEmail: string;
  totalPrice: number;
  reservationDate: Date;
  status: 'confirmed' | 'cancelled';
}

@Injectable()
export class ReservationsService {
  private reservations: Reservation[] = [];
  private nextId = 1;
  private sessionLocks = new Map<number, boolean>(); // Simple in-memory locking mechanism

  constructor(private sessionsService: SessionsService) {}

  async createReservation(
    createReservationDto: CreateReservationDto,
  ): Promise<Reservation> {
    const { sessionId, userId, seatsCount, customerName, customerEmail } =
      createReservationDto;

    // Start transaction simulation
    return this.executeInTransaction(async () => {
      // 1. SELECT ... FOR UPDATE on session (lock to prevent concurrent modifications)
      await this.lockSessionForUpdate(sessionId);

      try {
        // 2. Get session details and check available seats
        const session = await this.sessionsService.findOne(sessionId);

        if (!session) {
          throw new HttpException('Session not found', HttpStatus.NOT_FOUND);
        }

        // 3. Check if enough seats are available
        if (session.availableSeats < seatsCount) {
          throw new HttpException(
            `Not enough available seats. Requested: ${seatsCount}, Available: ${session.availableSeats}`,
            HttpStatus.BAD_REQUEST,
          );
        }

        // 4. Decrease available seats and save session
        const updatedSession = await this.sessionsService.update(sessionId, {
          availableSeats: session.availableSeats - seatsCount,
        });

        if (!updatedSession) {
          throw new HttpException(
            'Failed to update session',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }

        // 5. Create and insert reservation
        const newReservation: Reservation = {
          id: this.nextId++,
          sessionId,
          userId,
          seatsCount,
          customerName,
          customerEmail,
          totalPrice: session.price * seatsCount,
          reservationDate: new Date(),
          status: 'confirmed',
        };

        this.reservations.push(newReservation);

        return newReservation;
      } finally {
        // Release the lock
        this.unlockSession(sessionId);
      }
    });
  }

  async findAll(): Promise<Reservation[]> {
    return this.reservations;
  }

  async findOne(id: number): Promise<Reservation | undefined> {
    return this.reservations.find((reservation) => reservation.id === id);
  }

  async findByUserId(userId: number): Promise<Reservation[]> {
    return this.reservations.filter(
      (reservation) => reservation.userId === userId,
    );
  }

  async findBySessionId(sessionId: number): Promise<Reservation[]> {
    return this.reservations.filter(
      (reservation) => reservation.sessionId === sessionId,
    );
  }

  async cancelReservation(id: number): Promise<Reservation | undefined> {
    const reservation = await this.findOne(id);

    if (!reservation) {
      return undefined;
    }

    if (reservation.status === 'cancelled') {
      throw new HttpException(
        'Reservation is already cancelled',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Return seats to session
    const session = await this.sessionsService.findOne(reservation.sessionId);
    if (session) {
      await this.sessionsService.update(reservation.sessionId, {
        availableSeats: session.availableSeats + reservation.seatsCount,
      });
    }

    // Update reservation status
    reservation.status = 'cancelled';

    return reservation;
  }

  // Transaction simulation methods
  private async executeInTransaction<T>(
    operation: () => Promise<T>,
  ): Promise<T> {
    // In a real application, this would use database transaction
    // For now, we simulate with try-catch and manual rollback
    try {
      return await operation();
    } catch (error) {
      // In real app, this would rollback the transaction
      throw error;
    }
  }

  private async lockSessionForUpdate(sessionId: number): Promise<void> {
    // Simulate SELECT ... FOR UPDATE with in-memory locking
    if (this.sessionLocks.get(sessionId)) {
      throw new HttpException(
        'Session is currently being modified by another process',
        HttpStatus.CONFLICT,
      );
    }

    this.sessionLocks.set(sessionId, true);

    // Small delay to simulate database lock acquisition
    await new Promise((resolve) => setTimeout(resolve, 10));
  }

  private unlockSession(sessionId: number): void {
    this.sessionLocks.delete(sessionId);
  }
}

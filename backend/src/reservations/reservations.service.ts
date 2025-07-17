import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SessionsService } from '../sessions/sessions.service';
import { Reservation } from '../entities/reservation.entity';
import { User } from '../entities/user.entity';
import { Session } from '../entities/session.entity';

export interface CreateReservationDto {
  sessionId: number;
  userId: number;
  seatsCount: number;
  seatNumbers: number[]; // Array of specific seat numbers
  customerName: string;
  customerEmail: string;
}

@Injectable()
export class ReservationsService {
  private sessionLocks = new Map<number, boolean>(); // Simple in-memory locking mechanism

  constructor(
    @InjectRepository(Reservation)
    private reservationRepository: Repository<Reservation>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Session)
    private sessionRepository: Repository<Session>,
    private sessionsService: SessionsService,
  ) {}

  async createReservation(
    createReservationDto: CreateReservationDto,
  ): Promise<Reservation> {
    const { sessionId, userId, seatsCount, seatNumbers } =
      createReservationDto;

    // Validate that seatNumbers array length matches seatsCount
    if (seatNumbers.length !== seatsCount) {
      throw new HttpException(
        `Seat numbers count (${seatNumbers.length}) does not match seats count (${seatsCount})`,
        HttpStatus.BAD_REQUEST,
      );
    }

    // Start transaction
    return await this.reservationRepository.manager.transaction(async manager => {
      // 1. Lock and get session
      const session = await manager.findOne(Session, {
        where: { id: sessionId },
        lock: { mode: 'pessimistic_write' }
      });

      if (!session) {
        throw new HttpException('Session not found', HttpStatus.NOT_FOUND);
      }

      // 2. Check if enough seats are available
      if (session.availableSeats < seatsCount) {
        throw new HttpException(
          `Not enough available seats. Requested: ${seatsCount}, Available: ${session.availableSeats}`,
          HttpStatus.BAD_REQUEST,
        );
      }

      // 3. Check if any of the requested seats are already booked
      const existingReservations = await manager.find(Reservation, {
        where: { session: { id: sessionId } },
        relations: ['session']
      });
      
      const bookedSeats = existingReservations
        .flatMap(r => r.seatNumbers || []);
      
      const conflictingSeats = seatNumbers.filter(seat => bookedSeats.includes(seat));
      if (conflictingSeats.length > 0) {
        throw new HttpException(
          `Seats already booked: ${conflictingSeats.join(', ')}`,
          HttpStatus.BAD_REQUEST,
        );
      }

      // 4. Get user
      const user = await manager.findOne(User, { where: { id: userId } });
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      // 5. Create reservation
      const reservation = manager.create(Reservation, {
        user,
        session,
        seatsBooked: seatsCount,
        seatNumbers,
      });

      await manager.save(reservation);

      // 6. Update session available seats
      session.availableSeats = session.availableSeats - seatsCount;
      await manager.save(session);

      return reservation;
    });
  }

  async findAll(): Promise<Reservation[]> {
    return await this.reservationRepository.find({
      relations: ['user', 'session']
    });
  }

  async findOne(id: number): Promise<Reservation | null> {
    return await this.reservationRepository.findOne({
      where: { id },
      relations: ['user', 'session']
    });
  }

  async findByUserId(userId: number): Promise<Reservation[]> {
    return await this.reservationRepository.find({
      where: { user: { id: userId } },
      relations: ['user', 'session']
    });
  }

  async findBySessionId(sessionId: number): Promise<Reservation[]> {
    return await this.reservationRepository.find({
      where: { session: { id: sessionId } },
      relations: ['user', 'session']
    });
  }

  async getBookedSeatsForSession(sessionId: number): Promise<number[]> {
    const reservations = await this.findBySessionId(sessionId);
    return reservations.flatMap(r => r.seatNumbers || []);
  }

  async modifyReservation(id: number, newSeatNumbers: number[], expectedVersion?: number): Promise<Reservation | null> {
    const reservation = await this.reservationRepository.findOne({
      where: { id },
      relations: ['session', 'user']
    });

    if (!reservation) {
      return null;
    }

    // Check version for optimistic concurrency control
    if (expectedVersion !== undefined && reservation.version !== expectedVersion) {
      throw new HttpException(
        `Konflikt wersji. Rezerwacja została zmodyfikowana przez innego użytkownika. Aktualna wersja: ${reservation.version}, oczekiwana: ${expectedVersion}`,
        HttpStatus.CONFLICT
      );
    }

    return await this.reservationRepository.manager.transaction(async manager => {
      // Lock the session
      const session = await manager.findOne(Session, {
        where: { id: reservation.session.id },
        lock: { mode: 'pessimistic_write' }
      });

      if (!session) {
        throw new HttpException('Session not found', HttpStatus.NOT_FOUND);
      }

      // Check if the new seats are available
      const existingReservations = await manager.find(Reservation, {
        where: { session: { id: reservation.session.id } },
        relations: ['session']
      });

      // Get booked seats excluding the current reservation
      const bookedSeats = existingReservations
        .filter(r => r.id !== reservation.id)
        .flatMap(r => r.seatNumbers || []);

      const conflictingSeats = newSeatNumbers.filter(seat => bookedSeats.includes(seat));
      if (conflictingSeats.length > 0) {
        throw new HttpException(
          `Seats already booked: ${conflictingSeats.join(', ')}`,
          HttpStatus.BAD_REQUEST,
        );
      }

      // Calculate seat difference
      const oldSeatCount = reservation.seatsBooked;
      const newSeatCount = newSeatNumbers.length;
      const seatDifference = newSeatCount - oldSeatCount;

      // Check if there are enough available seats for the change
      if (seatDifference > 0 && session.availableSeats < seatDifference) {
        throw new HttpException(
          `Not enough available seats. Requested additional: ${seatDifference}, Available: ${session.availableSeats}`,
          HttpStatus.BAD_REQUEST,
        );
      }

      // Update reservation
      reservation.seatNumbers = newSeatNumbers;
      reservation.seatsBooked = newSeatCount;
      await manager.save(reservation);

      // Update session available seats
      session.availableSeats = session.availableSeats - seatDifference;
      await manager.save(session);

      return reservation;
    });
  }

  async cancelReservation(id: number, expectedVersion?: number): Promise<{ success: boolean; message?: string }> {
    return await this.reservationRepository.manager.transaction(async manager => {
      // Find the reservation with lock for update
      const reservation = await manager.findOne(Reservation, {
        where: { id },
        relations: ['session', 'user'],
        lock: { mode: 'pessimistic_write' }
      });

      if (!reservation) {
        throw new HttpException('Reservation not found', HttpStatus.NOT_FOUND);
      }

      // Check version for optimistic concurrency control
      if (expectedVersion !== undefined && reservation.version !== expectedVersion) {
        throw new HttpException(
          `Konflikt wersji. Rezerwacja została zmodyfikowana przez innego użytkownika. Aktualna wersja: ${reservation.version}, oczekiwana: ${expectedVersion}`,
          HttpStatus.CONFLICT
        );
      }

      // Find and lock the session
      const session = await manager.findOne(Session, {
        where: { id: reservation.session.id },
        lock: { mode: 'pessimistic_write' }
      });

      if (!session) {
        throw new HttpException('Session not found', HttpStatus.NOT_FOUND);
      }

      // Return seats to available pool
      session.availableSeats += reservation.seatsBooked;

      // Save updated session
      await manager.save(session);

      // Remove the reservation
      await manager.remove(reservation);

      return { success: true };
    });
  }
}

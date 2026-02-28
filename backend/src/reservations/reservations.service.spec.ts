import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReservationsService } from './reservations.service';
import { SessionsService } from '../sessions/sessions.service';
import { Reservation } from '../entities/reservation.entity';
import { User } from '../entities/user.entity';
import { Session } from '../entities/session.entity';

describe('ReservationsService', () => {
  let service: ReservationsService;

  const mockUser = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
  };

  const mockSession = {
    id: 1,
    movie: 'Test Movie',
    startTime: new Date('2024-12-31T20:00:00Z'),
    totalSeats: 50,
    availableSeats: 45,
  };

  const mockReservation = {
    id: 1,
    user: mockUser,
    session: mockSession,
    seatsBooked: 2,
    seatNumbers: [5, 6],
  };

  const mockSessionsService = {
    findOne: jest.fn(),
  };

  const mockReservationRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
    manager: {
      transaction: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
    },
  };

  const mockSessionRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
    manager: {
      transaction: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
    },
  };

  const mockUserRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationsService,
        {
          provide: getRepositoryToken(Reservation),
          useValue: mockReservationRepository,
        },
        {
          provide: getRepositoryToken(Session),
          useValue: mockSessionRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: SessionsService,
          useValue: mockSessionsService,
        },
      ],
    }).compile();

    service = module.get<ReservationsService>(ReservationsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('cancelReservation', () => {
    it('should cancel a reservation successfully and return seats to session', async () => {
      const reservationId = 1;
      const mockTransactionManager = {
        findOne: jest.fn(),
        save: jest.fn(),
        remove: jest.fn(),
      };

      mockReservationRepository.manager.transaction.mockImplementation(
        async (callback) => callback(mockTransactionManager)
      );
      mockTransactionManager.findOne
        .mockResolvedValueOnce(mockReservation) // First call for reservation
        .mockResolvedValueOnce(mockSession); // Second call for session

      const result = await service.cancelReservation(reservationId);

      expect(mockReservationRepository.manager.transaction).toHaveBeenCalled();
      expect(mockTransactionManager.findOne).toHaveBeenCalledWith(Reservation, {
        where: { id: reservationId },
        relations: ['session', 'user'],
        lock: { mode: 'pessimistic_write' },
      });
      expect(mockTransactionManager.findOne).toHaveBeenCalledWith(Session, {
        where: { id: mockSession.id },
        lock: { mode: 'pessimistic_write' },
      });
      expect(mockTransactionManager.save).toHaveBeenCalledWith({
        ...mockSession,
        availableSeats: 47, // 45 + 2 = 47
      });
      expect(mockTransactionManager.remove).toHaveBeenCalledWith(mockReservation);
      expect(result).toEqual({ success: true });
    });

    it('should return null when reservation does not exist', async () => {
      const reservationId = 999;
      const mockTransactionManager = {
        findOne: jest.fn(),
      };

      mockReservationRepository.manager.transaction.mockImplementation(
        async (callback) => callback(mockTransactionManager)
      );
      mockTransactionManager.findOne.mockResolvedValue(null);

      await expect(service.cancelReservation(reservationId)).rejects.toThrow(
        new HttpException('Reservation not found', HttpStatus.NOT_FOUND)
      );

      expect(mockReservationRepository.manager.transaction).toHaveBeenCalled();
      expect(mockTransactionManager.findOne).toHaveBeenCalledWith(Reservation, {
        where: { id: reservationId },
        relations: ['session', 'user'],
        lock: { mode: 'pessimistic_write' },
      });
    });

    it('should handle case when session does not exist', async () => {
      const reservationId = 1;
      const mockTransactionManager = {
        findOne: jest.fn(),
      };

      mockReservationRepository.manager.transaction.mockImplementation(
        async (callback) => callback(mockTransactionManager)
      );
      mockTransactionManager.findOne
        .mockResolvedValueOnce(mockReservation) // First call for reservation
        .mockResolvedValueOnce(null); // Second call for session - not found

      await expect(service.cancelReservation(reservationId)).rejects.toThrow(
        new HttpException('Session not found', HttpStatus.NOT_FOUND)
      );

      expect(mockReservationRepository.manager.transaction).toHaveBeenCalled();
      expect(mockTransactionManager.findOne).toHaveBeenCalledWith(Reservation, {
        where: { id: reservationId },
        relations: ['session', 'user'],
        lock: { mode: 'pessimistic_write' },
      });
      expect(mockTransactionManager.findOne).toHaveBeenCalledWith(Session, {
        where: { id: mockSession.id },
        lock: { mode: 'pessimistic_write' },
      });
    });
  });

  describe('modifyReservation', () => {
    const newSeatNumbers = [7, 8, 9];

    it('should modify a reservation successfully when new seats are available', async () => {
      const reservationId = 1;
      const existingReservations = [
        { id: 2, seatNumbers: [1, 2] },
        { id: 3, seatNumbers: [3, 4] },
      ];
      const mockTransactionManager = {
        findOne: jest.fn(),
        find: jest.fn(),
        save: jest.fn(),
      };

      mockReservationRepository.findOne.mockResolvedValue(mockReservation);
      mockReservationRepository.manager.transaction.mockImplementation(
        async (callback) => callback(mockTransactionManager)
      );
      mockTransactionManager.findOne.mockResolvedValue(mockSession);
      mockTransactionManager.find.mockResolvedValue(existingReservations);

      const modifiedReservation = {
        ...mockReservation,
        seatNumbers: newSeatNumbers,
        seatsBooked: newSeatNumbers.length,
      };

      mockTransactionManager.save.mockResolvedValue(modifiedReservation);

      const result = await service.modifyReservation(reservationId, newSeatNumbers);

      expect(mockReservationRepository.findOne).toHaveBeenCalledWith({
        where: { id: reservationId },
        relations: ['session', 'user'],
      });
      expect(mockReservationRepository.manager.transaction).toHaveBeenCalled();
      expect(mockTransactionManager.findOne).toHaveBeenCalledWith(Session, {
        where: { id: mockSession.id },
        lock: { mode: 'pessimistic_write' },
      });
      expect(mockTransactionManager.find).toHaveBeenCalledWith(Reservation, {
        where: { session: { id: mockSession.id } },
        relations: ['session'],
      });

      // Should save updated reservation
      expect(mockTransactionManager.save).toHaveBeenCalledWith({
        ...mockReservation,
        seatNumbers: newSeatNumbers,
        seatsBooked: newSeatNumbers.length,
      });

      // Should save updated session with new available seats
      const seatDifference = newSeatNumbers.length - mockReservation.seatsBooked;
      expect(mockTransactionManager.save).toHaveBeenCalledWith({
        ...mockSession,
        availableSeats: mockSession.availableSeats - seatDifference,
      });

      expect(result).toEqual(modifiedReservation);
    });

    it('should return null when reservation does not exist', async () => {
      const reservationId = 999;

      mockReservationRepository.findOne.mockResolvedValue(null);

      const result = await service.modifyReservation(reservationId, newSeatNumbers);

      expect(mockReservationRepository.findOne).toHaveBeenCalledWith({
        where: { id: reservationId },
        relations: ['session', 'user'],
      });
      expect(mockReservationRepository.manager.transaction).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('should throw error when session does not exist', async () => {
      const reservationId = 1;
      const mockTransactionManager = {
        findOne: jest.fn(),
      };

      mockReservationRepository.findOne.mockResolvedValue(mockReservation);
      mockReservationRepository.manager.transaction.mockImplementation(
        async (callback) => callback(mockTransactionManager)
      );
      mockTransactionManager.findOne.mockResolvedValue(null);

      await expect(service.modifyReservation(reservationId, newSeatNumbers)).rejects.toThrow(
        new HttpException('Session not found', HttpStatus.NOT_FOUND)
      );

      expect(mockTransactionManager.findOne).toHaveBeenCalledWith(Session, {
        where: { id: mockSession.id },
        lock: { mode: 'pessimistic_write' },
      });
    });

    it('should throw error when new seats are already booked', async () => {
      const reservationId = 1;
      const conflictingSeatNumbers = [7, 8]; // These will conflict with existing bookings
      const existingReservations = [
        { id: 2, seatNumbers: [7, 8] }, // Conflict with our new seats
        { id: 3, seatNumbers: [3, 4] },
      ];
      const mockTransactionManager = {
        findOne: jest.fn(),
        find: jest.fn(),
      };

      mockReservationRepository.findOne.mockResolvedValue(mockReservation);
      mockReservationRepository.manager.transaction.mockImplementation(
        async (callback) => callback(mockTransactionManager)
      );
      mockTransactionManager.findOne.mockResolvedValue(mockSession);
      mockTransactionManager.find.mockResolvedValue(existingReservations);

      await expect(service.modifyReservation(reservationId, conflictingSeatNumbers)).rejects.toThrow(
        new HttpException('Seats already booked: 7, 8', HttpStatus.BAD_REQUEST)
      );

      expect(mockTransactionManager.find).toHaveBeenCalledWith(Reservation, {
        where: { session: { id: mockSession.id } },
        relations: ['session'],
      });
    });


    it('should handle decreasing seat count correctly', async () => {
      const reservationId = 1;
      const fewerSeatNumbers = [7]; // 1 seat (decrease of 1 from current 2)
      const existingReservations = [
        { id: 2, seatNumbers: [1, 2] },
        { id: 3, seatNumbers: [3, 4] },
      ];
      const mockTransactionManager = {
        findOne: jest.fn(),
        find: jest.fn(),
        save: jest.fn(),
      };

      mockReservationRepository.findOne.mockResolvedValue(mockReservation);
      mockReservationRepository.manager.transaction.mockImplementation(
        async (callback) => callback(mockTransactionManager)
      );
      mockTransactionManager.findOne.mockResolvedValue(mockSession);
      mockTransactionManager.find.mockResolvedValue(existingReservations);

      const modifiedReservation = {
        ...mockReservation,
        seatNumbers: fewerSeatNumbers,
        seatsBooked: fewerSeatNumbers.length,
      };

      mockTransactionManager.save.mockResolvedValue(modifiedReservation);

      const result = await service.modifyReservation(reservationId, fewerSeatNumbers);

      // Should increase available seats since we're decreasing booked seats
      const seatDifference = fewerSeatNumbers.length - mockReservation.seatsBooked; // 1 - 2 = -1
      expect(mockTransactionManager.save).toHaveBeenCalledWith({
        ...mockSession,
        availableSeats: mockSession.availableSeats - seatDifference, // 45 - (-1) = 46
      });

      expect(result).toEqual(modifiedReservation);
    });

    it('should exclude current reservation when checking for seat conflicts', async () => {
      const reservationId = 1;
      const newSeats = [7, 8];
      const existingReservations = [
        { id: 1, seatNumbers: [5, 6] }, // This is the current reservation being modified
        { id: 2, seatNumbers: [1, 2] },
        { id: 3, seatNumbers: [3, 4] },
      ];
      const mockTransactionManager = {
        findOne: jest.fn(),
        find: jest.fn(),
        save: jest.fn(),
      };

      mockReservationRepository.findOne.mockResolvedValue(mockReservation);
      mockReservationRepository.manager.transaction.mockImplementation(
        async (callback) => callback(mockTransactionManager)
      );
      mockTransactionManager.findOne.mockResolvedValue(mockSession);
      mockTransactionManager.find.mockResolvedValue(existingReservations);

      const modifiedReservation = {
        ...mockReservation,
        seatNumbers: newSeats,
        seatsBooked: newSeats.length,
      };

      mockTransactionManager.save.mockResolvedValue(modifiedReservation);

      const result = await service.modifyReservation(reservationId, newSeats);

      // Should not throw error even though current reservation has seats [5, 6]
      // because it excludes the current reservation from conflict checking
      expect(result).toEqual(modifiedReservation);
    });
  });

  describe('createReservation', () => {
    it('should create a reservation successfully within a transaction', async () => {
      const dto = {
        sessionId: 1,
        userId: 1,
        seatsCount: 2,
        seatNumbers: [5, 6],
        customerName: 'Test User',
        customerEmail: 'test@example.com',
      };
      const mockTransactionManager = {
        findOne: jest.fn(),
        find: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
      };

      mockReservationRepository.manager.transaction.mockImplementation(
        async (callback) => callback(mockTransactionManager)
      );
      mockTransactionManager.findOne.mockResolvedValue({ ...mockSession, availableSeats: 45 });
      mockTransactionManager.find.mockResolvedValue([]); // no existing reservations
      mockTransactionManager.create = jest.fn().mockReturnValue(mockReservation);
      mockTransactionManager.save.mockResolvedValueOnce(mockReservation).mockResolvedValueOnce(mockSession);

      const result = await service.createReservation(dto);

      expect(mockReservationRepository.manager.transaction).toHaveBeenCalled();
      expect(result).toEqual(mockReservation);
    });

    it('should throw BAD_REQUEST when seat count does not match seatNumbers length', async () => {
      const dto = {
        sessionId: 1,
        userId: 1,
        seatsCount: 3,
        seatNumbers: [5, 6], // only 2 but seatsCount is 3
        customerName: 'Test User',
        customerEmail: 'test@example.com',
      };

      await expect(service.createReservation(dto)).rejects.toThrow(HttpException);
    });

    it('should throw BAD_REQUEST when requested seats are already booked', async () => {
      const dto = {
        sessionId: 1,
        userId: 1,
        seatsCount: 2,
        seatNumbers: [5, 6],
        customerName: 'Test User',
        customerEmail: 'test@example.com',
      };
      const mockTransactionManager = {
        findOne: jest.fn(),
        find: jest.fn(),
        save: jest.fn(),
      };

      mockReservationRepository.manager.transaction.mockImplementation(
        async (callback) => callback(mockTransactionManager)
      );
      mockTransactionManager.findOne.mockResolvedValue({ ...mockSession, availableSeats: 45 });
      mockTransactionManager.find.mockResolvedValue([
        { id: 99, seatNumbers: [5, 6] }, // seats 5 and 6 already booked
      ]);

      await expect(service.createReservation(dto)).rejects.toThrow(HttpException);
    });
  });

  describe('findAll', () => {
    it('should return all reservations with relations', async () => {
      mockReservationRepository.find.mockResolvedValue([mockReservation]);

      const result = await service.findAll();

      expect(mockReservationRepository.find).toHaveBeenCalledWith({
        relations: ['user', 'session'],
      });
      expect(result).toEqual([mockReservation]);
    });
  });

  describe('findOne', () => {
    it('should return a reservation by id', async () => {
      mockReservationRepository.findOne.mockResolvedValue(mockReservation);

      const result = await service.findOne(1);

      expect(mockReservationRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['user', 'session'],
      });
      expect(result).toEqual(mockReservation);
    });

    it('should return null when reservation does not exist', async () => {
      mockReservationRepository.findOne.mockResolvedValue(null);

      const result = await service.findOne(999);

      expect(result).toBeNull();
    });
  });

  describe('findByUserId', () => {
    it('should return all reservations for a user', async () => {
      mockReservationRepository.find.mockResolvedValue([mockReservation]);

      const result = await service.findByUserId(1);

      expect(mockReservationRepository.find).toHaveBeenCalledWith({
        where: { user: { id: 1 } },
        relations: ['user', 'session'],
      });
      expect(result).toEqual([mockReservation]);
    });
  });

  describe('findBySessionId', () => {
    it('should return all reservations for a session', async () => {
      mockReservationRepository.find.mockResolvedValue([mockReservation]);

      const result = await service.findBySessionId(1);

      expect(mockReservationRepository.find).toHaveBeenCalledWith({
        where: { session: { id: 1 } },
        relations: ['user', 'session'],
      });
      expect(result).toEqual([mockReservation]);
    });
  });

  describe('getBookedSeatsForSession', () => {
    it('should return flat list of booked seat numbers for a session', async () => {
      const reservation1 = { ...mockReservation, seatNumbers: [5, 6] };
      const reservation2 = { ...mockReservation, id: 2, seatNumbers: [10, 11] };
      mockReservationRepository.find.mockResolvedValue([reservation1, reservation2]);

      const result = await service.getBookedSeatsForSession(1);

      expect(result).toEqual([5, 6, 10, 11]);
    });

    it('should return empty array when no reservations exist', async () => {
      mockReservationRepository.find.mockResolvedValue([]);

      const result = await service.getBookedSeatsForSession(1);

      expect(result).toEqual([]);
    });
  });
});

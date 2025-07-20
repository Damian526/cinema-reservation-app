import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ReservationsController } from './reservations.controller';
import { ReservationsService } from './reservations.service';

describe('ReservationsController', () => {
  let controller: ReservationsController;

  const mockReservationsService = {
    findOne: jest.fn(),
    cancelReservation: jest.fn(),
    modifyReservation: jest.fn(),
    createReservation: jest.fn(),
    findAll: jest.fn(),
    findByUserId: jest.fn(),
    findBySessionId: jest.fn(),
    getBookedSeatsForSession: jest.fn(),
  };

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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReservationsController],
      providers: [
        {
          provide: ReservationsService,
          useValue: mockReservationsService,
        },
      ],
    }).compile();

    controller = module.get<ReservationsController>(ReservationsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('cancelReservation', () => {
    const mockRequest = { user: { userId: 1 } };

    it('should cancel a reservation successfully when user owns it', async () => {
      const reservationId = 1;
      const cancelResult = { success: true };

      mockReservationsService.findOne.mockResolvedValue(mockReservation);
      mockReservationsService.cancelReservation.mockResolvedValue(cancelResult);

      const result = await controller.cancelReservation(reservationId, { expectedVersion: 1 }, mockRequest);

      expect(mockReservationsService.findOne).toHaveBeenCalledWith(reservationId);
      expect(mockReservationsService.cancelReservation).toHaveBeenCalledWith(reservationId, 1);
      expect(result).toEqual(cancelResult);
    });

    it('should throw NOT_FOUND when reservation does not exist', async () => {
      const reservationId = 999;

      mockReservationsService.findOne.mockResolvedValue(null);

      await expect(
        controller.cancelReservation(reservationId, { expectedVersion: 1 }, mockRequest)
      ).rejects.toThrow(
        new HttpException('Reservation not found', HttpStatus.NOT_FOUND)
      );

      expect(mockReservationsService.findOne).toHaveBeenCalledWith(reservationId);
      expect(mockReservationsService.cancelReservation).not.toHaveBeenCalled();
    });

    it('should throw FORBIDDEN when user does not own the reservation', async () => {
      const reservationId = 1;
      const otherUserReservation = {
        ...mockReservation,
        user: { id: 2, username: 'otheruser', email: 'other@example.com' },
      };

      mockReservationsService.findOne.mockResolvedValue(otherUserReservation);

      await expect(
        controller.cancelReservation(reservationId, { expectedVersion: 1 }, mockRequest)
      ).rejects.toThrow(
        new HttpException(
          'You can only cancel your own reservations',
          HttpStatus.FORBIDDEN
        )
      );

      expect(mockReservationsService.findOne).toHaveBeenCalledWith(reservationId);
      expect(mockReservationsService.cancelReservation).not.toHaveBeenCalled();
    });

    it('should throw INTERNAL_SERVER_ERROR when cancellation fails', async () => {
      const reservationId = 1;

      mockReservationsService.findOne.mockResolvedValue(mockReservation);
      mockReservationsService.cancelReservation.mockRejectedValue(
        new Error('Database error')
      );

      await expect(
        controller.cancelReservation(reservationId, { expectedVersion: 1 }, mockRequest)
      ).rejects.toThrow(
        new HttpException(
          'Failed to cancel reservation',
          HttpStatus.INTERNAL_SERVER_ERROR
        )
      );

      expect(mockReservationsService.findOne).toHaveBeenCalledWith(reservationId);
      expect(mockReservationsService.cancelReservation).toHaveBeenCalledWith(reservationId, 1);
    });
  });

  describe('modifyReservation', () => {
    const mockRequest = { user: { userId: 1 } };
    const modifyData = { seatNumbers: [7, 8, 9] };

    it('should modify a reservation successfully when user owns it and session has not started', async () => {
      const reservationId = 1;
      const futureSession = {
        ...mockSession,
        startTime: new Date(Date.now() + 3600000), // 1 hour in the future
      };
      const futureReservation = { ...mockReservation, session: futureSession };
      const modifiedReservation = {
        ...futureReservation,
        seatNumbers: [7, 8, 9],
        seatsBooked: 3,
      };

      mockReservationsService.findOne.mockResolvedValue(futureReservation);
      mockReservationsService.modifyReservation.mockResolvedValue(modifiedReservation);

      const result = await controller.modifyReservation(reservationId, modifyData, mockRequest);

      expect(mockReservationsService.findOne).toHaveBeenCalledWith(reservationId);
      expect(mockReservationsService.modifyReservation).toHaveBeenCalledWith(
        reservationId,
        modifyData.seatNumbers,
        undefined
      );
      expect(result).toEqual(modifiedReservation);
    });

    it('should throw NOT_FOUND when reservation does not exist', async () => {
      const reservationId = 999;

      mockReservationsService.findOne.mockResolvedValue(null);

      await expect(
        controller.modifyReservation(reservationId, modifyData, mockRequest)
      ).rejects.toThrow(
        new HttpException('Reservation not found', HttpStatus.NOT_FOUND)
      );

      expect(mockReservationsService.findOne).toHaveBeenCalledWith(reservationId);
      expect(mockReservationsService.modifyReservation).not.toHaveBeenCalled();
    });

    it('should throw FORBIDDEN when user does not own the reservation', async () => {
      const reservationId = 1;
      const otherUserReservation = {
        ...mockReservation,
        user: { id: 2, username: 'otheruser', email: 'other@example.com' },
      };

      mockReservationsService.findOne.mockResolvedValue(otherUserReservation);

      await expect(
        controller.modifyReservation(reservationId, modifyData, mockRequest)
      ).rejects.toThrow(
        new HttpException(
          'You can only modify your own reservations',
          HttpStatus.FORBIDDEN
        )
      );

      expect(mockReservationsService.findOne).toHaveBeenCalledWith(reservationId);
      expect(mockReservationsService.modifyReservation).not.toHaveBeenCalled();
    });

    it('should throw BAD_REQUEST when session has already started', async () => {
      const reservationId = 1;
      const pastSession = {
        ...mockSession,
        startTime: new Date(Date.now() - 3600000), // 1 hour in the past
      };
      const pastReservation = { ...mockReservation, session: pastSession };

      mockReservationsService.findOne.mockResolvedValue(pastReservation);

      await expect(
        controller.modifyReservation(reservationId, modifyData, mockRequest)
      ).rejects.toThrow(
        new HttpException(
          'Cannot modify reservation for a session that has already started',
          HttpStatus.BAD_REQUEST
        )
      );

      expect(mockReservationsService.findOne).toHaveBeenCalledWith(reservationId);
      expect(mockReservationsService.modifyReservation).not.toHaveBeenCalled();
    });

    it('should throw INTERNAL_SERVER_ERROR when modification fails', async () => {
      const reservationId = 1;
      const futureSession = {
        ...mockSession,
        startTime: new Date(Date.now() + 3600000), // 1 hour in the future
      };
      const futureReservation = { ...mockReservation, session: futureSession };

      mockReservationsService.findOne.mockResolvedValue(futureReservation);
      mockReservationsService.modifyReservation.mockResolvedValue(null);

      await expect(
        controller.modifyReservation(reservationId, modifyData, mockRequest)
      ).rejects.toThrow(
        new HttpException(
          'Failed to modify reservation',
          HttpStatus.INTERNAL_SERVER_ERROR
        )
      );

      expect(mockReservationsService.findOne).toHaveBeenCalledWith(reservationId);
      expect(mockReservationsService.modifyReservation).toHaveBeenCalledWith(
        reservationId,
        modifyData.seatNumbers,
        undefined
      );
    });
  });

  describe('getReservationDetails', () => {
    const mockRequest = { user: { userId: 1 } };

    it('should return reservation details when user owns the reservation', async () => {
      const reservationId = 1;

      mockReservationsService.findOne.mockResolvedValue(mockReservation);

      const result = await controller.getReservationDetails(reservationId, mockRequest);

      expect(mockReservationsService.findOne).toHaveBeenCalledWith(reservationId);
      expect(result).toEqual(mockReservation);
    });

    it('should throw NOT_FOUND when reservation does not exist', async () => {
      const reservationId = 999;

      mockReservationsService.findOne.mockResolvedValue(null);

      await expect(
        controller.getReservationDetails(reservationId, mockRequest)
      ).rejects.toThrow(
        new HttpException('Reservation not found', HttpStatus.NOT_FOUND)
      );

      expect(mockReservationsService.findOne).toHaveBeenCalledWith(reservationId);
    });

    it('should throw FORBIDDEN when user does not own the reservation', async () => {
      const reservationId = 1;
      const otherUserReservation = {
        ...mockReservation,
        user: { id: 2, username: 'otheruser', email: 'other@example.com' },
      };

      mockReservationsService.findOne.mockResolvedValue(otherUserReservation);

      await expect(
        controller.getReservationDetails(reservationId, mockRequest)
      ).rejects.toThrow(
        new HttpException(
          'You can only view your own reservations',
          HttpStatus.FORBIDDEN
        )
      );

      expect(mockReservationsService.findOne).toHaveBeenCalledWith(reservationId);
    });
  });
});

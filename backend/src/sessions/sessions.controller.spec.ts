import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { SessionsController } from './sessions.controller';
import { SessionsService } from './sessions.service';
import { Session } from '../entities/session.entity';

/* ─── Mock factory ───────────────────────────────────────────────── */
const mockSessionsService = () => ({
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  bookSeats: jest.fn(),
});

const sampleSession = (id = 1): Session =>
  ({
    id,
    movieTitle: 'Inception',
    description: '',
    startTime: new Date('2026-06-01T18:00:00Z'),
    endTime: new Date('2026-06-01T20:30:00Z'),
    totalSeats: 100,
    availableSeats: 80,
    price: 25,
    roomNumber: 1,
    movie: null,
    movieId: null,
    reservations: [],
    version: 1,
  }) as unknown as Session;

/* ─── Suite ──────────────────────────────────────────────────────── */
describe('SessionsController', () => {
  let controller: SessionsController;
  let service: ReturnType<typeof mockSessionsService>;

  beforeEach(async () => {
    service = mockSessionsService();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SessionsController],
      providers: [{ provide: SessionsService, useValue: service }],
    }).compile();

    controller = module.get<SessionsController>(SessionsController);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => expect(controller).toBeDefined());

  /* ── POST /sessions (admin) ──────────────────────────────────── */
  describe('create', () => {
    const dto = {
      movieTitle: 'Inception',
      startTime: '2026-06-01T18:00:00Z',
      endTime: '2026-06-01T20:30:00Z',
      totalSeats: 100,
      price: 25,
      roomNumber: 1,
    };

    it('creates and returns a new session', async () => {
      const session = sampleSession();
      service.create.mockResolvedValue(session);

      const result = await controller.create(dto as any);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(session);
    });
  });

  /* ── GET /sessions ───────────────────────────────────────────── */
  describe('findAll', () => {
    it('returns all sessions', async () => {
      const sessions = [sampleSession(1), sampleSession(2)];
      service.findAll.mockResolvedValue(sessions);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(sessions);
    });

    it('returns empty array when no sessions exist', async () => {
      service.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toEqual([]);
    });
  });

  /* ── GET /sessions/:id ───────────────────────────────────────── */
  describe('findOne', () => {
    it('returns session when found', async () => {
      const session = sampleSession();
      service.findOne.mockResolvedValue(session);

      const result = await controller.findOne(1);

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(session);
    });

    it('throws 404 when session does not exist', async () => {
      service.findOne.mockResolvedValue(null);

      await expect(controller.findOne(99)).rejects.toThrow(
        new HttpException('Session not found', HttpStatus.NOT_FOUND),
      );
    });
  });

  /* ── PATCH /sessions/:id (admin) ─────────────────────────────── */
  describe('update', () => {
    it('updates and returns modified session', async () => {
      const updated = { ...sampleSession(), price: 30 } as Session;
      service.update.mockResolvedValue(updated);

      const result = await controller.update(1, { price: 30 } as any);

      expect(service.update).toHaveBeenCalledWith(1, { price: 30 });
      expect(result).toEqual(updated);
    });

    it('throws 404 when session does not exist', async () => {
      service.update.mockResolvedValue(null);

      await expect(controller.update(99, {} as any)).rejects.toThrow(
        new HttpException('Session not found', HttpStatus.NOT_FOUND),
      );
    });
  });

  /* ── DELETE /sessions/:id (admin) ───────────────────────────── */
  describe('remove', () => {
    it('deletes session and returns success message', async () => {
      service.remove.mockResolvedValue(true);

      const result = await controller.remove(1);

      expect(service.remove).toHaveBeenCalledWith(1);
      expect(result).toEqual({ message: 'Session deleted successfully' });
    });

    it('throws 404 when session does not exist', async () => {
      service.remove.mockResolvedValue(false);

      await expect(controller.remove(99)).rejects.toThrow(
        new HttpException('Session not found', HttpStatus.NOT_FOUND),
      );
    });

    it('propagates ConflictException from service (has reservations)', async () => {
      const { ConflictException } = await import('@nestjs/common');
      service.remove.mockRejectedValue(
        new ConflictException('Cannot delete session with existing reservations'),
      );

      await expect(controller.remove(1)).rejects.toThrow(ConflictException);
    });
  });

  /* ── POST /sessions/:id/book ─────────────────────────────────── */
  describe('bookSeats', () => {
    it('books seats and returns updated session', async () => {
      const updated = { ...sampleSession(), availableSeats: 77 } as Session;
      service.bookSeats.mockResolvedValue(updated);

      const result = await controller.bookSeats(1, 3);

      expect(service.bookSeats).toHaveBeenCalledWith(1, 3);
      expect(result).toEqual(updated);
    });

    it('throws 400 when session not found', async () => {
      service.bookSeats.mockResolvedValue(null);

      await expect(controller.bookSeats(1, 5)).rejects.toThrow(
        new HttpException(
          'Session not found or not enough available seats',
          HttpStatus.BAD_REQUEST,
        ),
      );
    });

    it('throws 400 when not enough seats available', async () => {
      service.bookSeats.mockResolvedValue(null); // service returns null for both cases

      await expect(controller.bookSeats(1, 200)).rejects.toThrow(
        new HttpException(
          'Session not found or not enough available seats',
          HttpStatus.BAD_REQUEST,
        ),
      );
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { AdminSessionsController } from './admin-sessions.controller';
import { SessionsService } from './sessions.service';
import { Session } from '../entities/session.entity';

/* ─── Mock service ───────────────────────────────────────────────── */
const mockSessionsService = () => ({
  findAllAdmin: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
});

const sampleSession = (id = 1): Session =>
  ({
    id,
    movieTitle: 'Inception',
    description: '',
    startTime: new Date('2026-06-01T18:00:00Z'),
    endTime: new Date('2026-06-01T20:30:00Z'),
    totalSeats: 100,
    availableSeats: 100,
    price: 25,
    roomNumber: 1,
    movie: null,
    movieId: null,
    reservations: [],
    version: 1,
  }) as unknown as Session;

/* ─── Suite ──────────────────────────────────────────────────────── */
describe('AdminSessionsController', () => {
  let controller: AdminSessionsController;
  let service: ReturnType<typeof mockSessionsService>;

  beforeEach(async () => {
    service = mockSessionsService();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminSessionsController],
      providers: [{ provide: SessionsService, useValue: service }],
    }).compile();

    controller = module.get<AdminSessionsController>(AdminSessionsController);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  /* ── GET /admin/sessions ─────────────────────────────────────── */
  describe('findAll', () => {
    it('returns paginated sessions with default params', async () => {
      const result = { data: [sampleSession()], total: 1 };
      service.findAllAdmin.mockResolvedValue(result);

      const res = await controller.findAll();

      expect(service.findAllAdmin).toHaveBeenCalledWith({
        page: 1,
        limit: 20,
        search: undefined,
        movieId: undefined,
        dateFrom: undefined,
        dateTo: undefined,
      });
      expect(res).toEqual(result);
    });

    it('parses and forwards all query params', async () => {
      service.findAllAdmin.mockResolvedValue({ data: [], total: 0 });

      await controller.findAll('2', '10', 'Incep', '5', '2026-06-01', '2026-12-31');

      expect(service.findAllAdmin).toHaveBeenCalledWith({
        page: 2,
        limit: 10,
        search: 'Incep',
        movieId: 5,
        dateFrom: '2026-06-01',
        dateTo: '2026-12-31',
      });
    });

    it('leaves movieId undefined when not provided', async () => {
      service.findAllAdmin.mockResolvedValue({ data: [], total: 0 });

      await controller.findAll(undefined, undefined, undefined, undefined);

      expect(service.findAllAdmin).toHaveBeenCalledWith(
        expect.objectContaining({ movieId: undefined }),
      );
    });

    it('returns empty data when no sessions match', async () => {
      service.findAllAdmin.mockResolvedValue({ data: [], total: 0 });

      const res = await controller.findAll(undefined, undefined, 'nonexistent');

      expect(res.data).toHaveLength(0);
      expect(res.total).toBe(0);
    });
  });

  /* ── GET /admin/sessions/:id ─────────────────────────────────── */
  describe('findOne', () => {
    it('returns the session when found', async () => {
      const session = sampleSession();
      service.findOne.mockResolvedValue(session);

      const res = await controller.findOne(1);

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(res).toEqual(session);
    });

    it('returns null when session does not exist', async () => {
      service.findOne.mockResolvedValue(null);

      const res = await controller.findOne(99);

      expect(res).toBeNull();
    });
  });

  /* ── POST /admin/sessions ────────────────────────────────────── */
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

      const res = await controller.create(dto as any);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(res).toEqual(session);
    });

    it('propagates NotFoundException when movieId is invalid', async () => {
      service.create.mockRejectedValue(new NotFoundException('Movie #999 not found'));

      await expect(controller.create({ ...dto, movieId: 999 } as any)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  /* ── PATCH /admin/sessions/:id ───────────────────────────────── */
  describe('update', () => {
    it('updates and returns the modified session', async () => {
      const updated = { ...sampleSession(), price: 30 } as Session;
      service.update.mockResolvedValue(updated);

      const res = await controller.update(1, { price: 30 } as any);

      expect(service.update).toHaveBeenCalledWith(1, { price: 30 });
      expect(res?.price).toBe(30);
    });

    it('returns null when session does not exist', async () => {
      service.update.mockResolvedValue(null);

      const res = await controller.update(99, {} as any);

      expect(res).toBeNull();
    });

    it('propagates NotFoundException when new movieId is invalid', async () => {
      service.update.mockRejectedValue(new NotFoundException('Movie #999 not found'));

      await expect(controller.update(1, { movieId: 999 } as any)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  /* ── DELETE /admin/sessions/:id ──────────────────────────────── */
  describe('remove', () => {
    it('calls service.remove and returns true on success', async () => {
      service.remove.mockResolvedValue(true);

      const res = await controller.remove(1);

      expect(service.remove).toHaveBeenCalledWith(1);
      expect(res).toBe(true);
    });

    it('returns false when session does not exist', async () => {
      service.remove.mockResolvedValue(false);

      const res = await controller.remove(99);

      expect(res).toBe(false);
    });

    it('propagates ConflictException when session has reservations', async () => {
      service.remove.mockRejectedValue(
        new ConflictException('Cannot delete session with existing reservations'),
      );

      await expect(controller.remove(1)).rejects.toThrow(ConflictException);
    });
  });
});

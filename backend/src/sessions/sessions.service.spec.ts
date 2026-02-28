import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { Session } from '../entities/session.entity';
import { Movie } from '../entities/movie.entity';

/* ─── Helpers ────────────────────────────────────────────────────── */
const sampleMovie = (id = 1): Movie =>
  ({
    id,
    title: 'Inception',
    durationMinutes: 148,
    posterUrl: null,
  }) as Movie;

const sampleSession = (id = 1, overrides: Partial<Session> = {}): Session =>
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
    ...overrides,
  }) as unknown as Session;

/* ─── QueryBuilder mock (chainable) ─────────────────────────────── */
const makeQB = (result: [Session[], number] = [[], 0]) => {
  const qb: any = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn().mockResolvedValue(result),
  };
  return qb;
};

/* ─── Mock repo factories ────────────────────────────────────────── */
const makeSessionRepo = (qb?: any) => ({
  findAndCount: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  createQueryBuilder: jest.fn().mockReturnValue(qb ?? makeQB()),
});

const makeMovieRepo = () => ({
  findOne: jest.fn(),
});

/* ─── Suite ──────────────────────────────────────────────────────── */
describe('SessionsService', () => {
  let service: SessionsService;
  let sessionRepo: ReturnType<typeof makeSessionRepo>;
  let movieRepo: ReturnType<typeof makeMovieRepo>;

  const initModule = async (qb?: any) => {
    sessionRepo = makeSessionRepo(qb);
    movieRepo = makeMovieRepo();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionsService,
        { provide: getRepositoryToken(Session), useValue: sessionRepo },
        { provide: getRepositoryToken(Movie), useValue: movieRepo },
      ],
    }).compile();

    service = module.get<SessionsService>(SessionsService);
  };

  beforeEach(() => initModule());
  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => expect(service).toBeDefined());

  /* ── create ──────────────────────────────────────────────────── */
  describe('create', () => {
    const baseDto = {
      movieTitle: 'Inception',
      startTime: '2026-06-01T18:00:00Z',
      endTime: '2026-06-01T20:30:00Z',
      totalSeats: 100,
      price: 25,
      roomNumber: 1,
    };

    it('creates session without movieId, sets availableSeats = totalSeats', async () => {
      const session = sampleSession();
      sessionRepo.create.mockReturnValue(session);
      sessionRepo.save.mockResolvedValue(session);

      const result = await service.create(baseDto);

      expect(movieRepo.findOne).not.toHaveBeenCalled();
      expect(sessionRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ availableSeats: 100, movieTitle: 'Inception' }),
      );
      expect(result).toEqual(session);
    });

    it('creates session with valid movieId, inherits title from movie', async () => {
      const movie = sampleMovie();
      movieRepo.findOne.mockResolvedValue(movie);
      const session = sampleSession(1, { movieId: 1, movieTitle: 'Inception' });
      sessionRepo.create.mockReturnValue(session);
      sessionRepo.save.mockResolvedValue(session);

      const result = await service.create({ ...baseDto, movieId: 1, movieTitle: 'ignored' });

      expect(movieRepo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(sessionRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ movieTitle: 'Inception' }),
      );
      expect(result.movieTitle).toBe('Inception');
    });

    it('throws NotFoundException when movieId does not exist', async () => {
      movieRepo.findOne.mockResolvedValue(null);

      await expect(service.create({ ...baseDto, movieId: 999 })).rejects.toThrow(
        NotFoundException,
      );
      expect(sessionRepo.save).not.toHaveBeenCalled();
    });
  });

  /* ── findAllAdmin ────────────────────────────────────────────── */
  describe('findAllAdmin', () => {
    it('returns { data, total } without filters', async () => {
      const sessions = [sampleSession(1), sampleSession(2)];
      const qb = makeQB([sessions, 2]);
      await initModule(qb);

      const result = await service.findAllAdmin({});

      expect(result).toEqual({ data: sessions, total: 2 });
      expect(qb.andWhere).not.toHaveBeenCalled();
    });

    it('applies search filter via andWhere LIKE', async () => {
      const qb = makeQB([[], 0]);
      await initModule(qb);

      await service.findAllAdmin({ search: 'Incep' });

      expect(qb.andWhere).toHaveBeenCalledWith('session.movieTitle LIKE :search', {
        search: '%Incep%',
      });
    });

    it('applies movieId filter', async () => {
      const qb = makeQB([[], 0]);
      await initModule(qb);

      await service.findAllAdmin({ movieId: 5 });

      expect(qb.andWhere).toHaveBeenCalledWith('session.movieId = :movieId', { movieId: 5 });
    });

    it('applies dateFrom filter', async () => {
      const qb = makeQB([[], 0]);
      await initModule(qb);

      await service.findAllAdmin({ dateFrom: '2026-06-01' });

      expect(qb.andWhere).toHaveBeenCalledWith('session.startTime >= :dateFrom', {
        dateFrom: new Date('2026-06-01'),
      });
    });

    it('applies dateTo filter', async () => {
      const qb = makeQB([[], 0]);
      await initModule(qb);

      await service.findAllAdmin({ dateTo: '2026-12-31' });

      expect(qb.andWhere).toHaveBeenCalledWith('session.startTime <= :dateTo', {
        dateTo: new Date('2026-12-31'),
      });
    });

    it('respects custom page and limit, skips correct rows', async () => {
      const qb = makeQB([[], 0]);
      await initModule(qb);

      await service.findAllAdmin({ page: 3, limit: 10 });

      expect(qb.skip).toHaveBeenCalledWith(20); // (3-1)*10
      expect(qb.take).toHaveBeenCalledWith(10);
    });

    it('caps limit at 100', async () => {
      const qb = makeQB([[], 0]);
      await initModule(qb);

      await service.findAllAdmin({ limit: 500 });

      expect(qb.take).toHaveBeenCalledWith(100);
    });
  });

  /* ── findOne ─────────────────────────────────────────────────── */
  describe('findOne', () => {
    it('returns session with movie relation when found', async () => {
      const session = sampleSession(1, { movie: sampleMovie() });
      sessionRepo.findOne.mockResolvedValue(session);

      const result = await service.findOne(1);

      expect(result).toEqual(session);
      expect(sessionRepo.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['movie'],
      });
    });

    it('returns null when session does not exist', async () => {
      sessionRepo.findOne.mockResolvedValue(null);

      const result = await service.findOne(99);

      expect(result).toBeNull();
    });
  });

  /* ── update ──────────────────────────────────────────────────── */
  describe('update', () => {
    it('updates and returns the modified session', async () => {
      const session = sampleSession();
      const saved = { ...session, price: 30 } as Session;
      sessionRepo.findOne.mockResolvedValue(session);
      sessionRepo.save.mockResolvedValue(saved);

      const result = await service.update(1, { price: 30 });

      expect(sessionRepo.save).toHaveBeenCalled();
      expect(result).toEqual(saved);
    });

    it('returns null when session does not exist', async () => {
      sessionRepo.findOne.mockResolvedValue(null);

      const result = await service.update(99, { price: 30 });

      expect(result).toBeNull();
      expect(sessionRepo.save).not.toHaveBeenCalled();
    });

    it('re-resolves movie when movieId changes', async () => {
      const session = sampleSession(1, { movieId: 1, movieTitle: 'Old' });
      const newMovie = sampleMovie(2);
      newMovie.title = 'Dune';
      sessionRepo.findOne.mockResolvedValue(session);
      movieRepo.findOne.mockResolvedValue(newMovie);
      sessionRepo.save.mockResolvedValue({ ...session, movieTitle: 'Dune' } as Session);

      const result = await service.update(1, { movieId: 2 });

      expect(movieRepo.findOne).toHaveBeenCalledWith({ where: { id: 2 } });
      expect(result?.movieTitle).toBe('Dune');
    });

    it('throws NotFoundException when new movieId does not exist', async () => {
      sessionRepo.findOne.mockResolvedValue(sampleSession());
      movieRepo.findOne.mockResolvedValue(null);

      await expect(service.update(1, { movieId: 999 })).rejects.toThrow(NotFoundException);
    });
  });

  /* ── remove ──────────────────────────────────────────────────── */
  describe('remove', () => {
    it('deletes session and returns true when no reservations', async () => {
      const session = sampleSession(1, { reservations: [] });
      sessionRepo.findOne.mockResolvedValue(session);
      sessionRepo.delete.mockResolvedValue({ affected: 1 });

      const result = await service.remove(1);

      expect(sessionRepo.delete).toHaveBeenCalledWith(1);
      expect(result).toBe(true);
    });

    it('returns false when session does not exist', async () => {
      sessionRepo.findOne.mockResolvedValue(null);

      const result = await service.remove(99);

      expect(result).toBe(false);
      expect(sessionRepo.delete).not.toHaveBeenCalled();
    });

    it('throws ConflictException when session has existing reservations', async () => {
      const session = sampleSession(1, {
        reservations: [{ id: 1 } as any],
      });
      sessionRepo.findOne.mockResolvedValue(session);

      await expect(service.remove(1)).rejects.toThrow(ConflictException);
      expect(sessionRepo.delete).not.toHaveBeenCalled();
    });
  });

  /* ── bookSeats ───────────────────────────────────────────────── */
  describe('bookSeats', () => {
    it('decrements availableSeats and returns updated session', async () => {
      const session = sampleSession(1, { availableSeats: 50 });
      const saved = { ...session, availableSeats: 47 } as Session;
      sessionRepo.findOne.mockResolvedValue(session);
      sessionRepo.save.mockResolvedValue(saved);

      const result = await service.bookSeats(1, 3);

      expect(result?.availableSeats).toBe(47);
    });

    it('returns null when session does not exist', async () => {
      sessionRepo.findOne.mockResolvedValue(null);

      const result = await service.bookSeats(99, 1);

      expect(result).toBeNull();
    });

    it('returns null when not enough available seats', async () => {
      const session = sampleSession(1, { availableSeats: 2 });
      sessionRepo.findOne.mockResolvedValue(session);

      const result = await service.bookSeats(1, 5);

      expect(result).toBeNull();
      expect(sessionRepo.save).not.toHaveBeenCalled();
    });

    it('allows booking exactly all remaining seats', async () => {
      const session = sampleSession(1, { availableSeats: 5 });
      const saved = { ...session, availableSeats: 0 } as Session;
      sessionRepo.findOne.mockResolvedValue(session);
      sessionRepo.save.mockResolvedValue(saved);

      const result = await service.bookSeats(1, 5);

      expect(result?.availableSeats).toBe(0);
    });
  });
});

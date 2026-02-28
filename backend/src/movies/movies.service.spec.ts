import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { Like } from 'typeorm';
import { MoviesService } from './movies.service';
import { Movie } from '../entities/movie.entity';

/* ─── Mock factory ───────────────────────────────────────────────── */
const makeMockRepo = () => ({
  findAndCount: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
});

const sampleMovie = (id = 1): Movie =>
  ({
    id,
    title: 'Inception',
    description: 'A dream within a dream',
    genre: 'Sci-Fi',
    director: 'Christopher Nolan',
    durationMinutes: 148,
    releaseYear: 2010,
    posterUrl: 'https://example.com/poster.jpg',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  }) as unknown as Movie;

/* ─── Suite ──────────────────────────────────────────────────────── */
describe('MoviesService', () => {
  let service: MoviesService;
  let repo: ReturnType<typeof makeMockRepo>;

  beforeEach(async () => {
    repo = makeMockRepo();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MoviesService,
        { provide: getRepositoryToken(Movie), useValue: repo },
      ],
    }).compile();

    service = module.get<MoviesService>(MoviesService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  /* ── findAll ─────────────────────────────────────────────────── */
  describe('findAll', () => {
    it('returns paginated movies without filters', async () => {
      const movies = [sampleMovie(1), sampleMovie(2)];
      repo.findAndCount.mockResolvedValue([movies, 2]);

      const result = await service.findAll({});

      expect(result).toEqual({ data: movies, total: 2, page: 1, limit: 20 });
      expect(repo.findAndCount).toHaveBeenCalledWith({
        where: {},
        order: { createdAt: 'DESC' },
        skip: 0,
        take: 20,
      });
    });

    it('applies search filter on title', async () => {
      repo.findAndCount.mockResolvedValue([[sampleMovie()], 1]);

      const result = await service.findAll({ search: 'Incep' });

      expect(result.data).toHaveLength(1);
      expect(repo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ where: { title: Like('%Incep%') } }),
      );
    });

    it('applies genre filter', async () => {
      repo.findAndCount.mockResolvedValue([[sampleMovie()], 1]);

      await service.findAll({ genre: 'Sci-Fi' });

      expect(repo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ where: { genre: 'Sci-Fi' } }),
      );
    });

    it('respects page and limit params', async () => {
      repo.findAndCount.mockResolvedValue([[], 50]);

      const result = await service.findAll({ page: 3, limit: 10 });

      expect(result.page).toBe(3);
      expect(result.limit).toBe(10);
      expect(repo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 20, take: 10 }),
      );
    });

    it('caps limit at 100', async () => {
      repo.findAndCount.mockResolvedValue([[], 0]);

      await service.findAll({ limit: 999 });

      expect(repo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ take: 100 }),
      );
    });

    it('defaults page to 1 when 0 is provided', async () => {
      repo.findAndCount.mockResolvedValue([[], 0]);

      const result = await service.findAll({ page: 0 });

      expect(result.page).toBe(1);
    });
  });

  /* ── findAllSimple ───────────────────────────────────────────── */
  describe('findAllSimple', () => {
    it('returns only selected fields ordered by title ASC', async () => {
      const simple = [
        { id: 1, title: 'Alien', durationMinutes: 117, posterUrl: null },
        { id: 2, title: 'Inception', durationMinutes: 148, posterUrl: 'url' },
      ];
      repo.find.mockResolvedValue(simple);

      const result = await service.findAllSimple();

      expect(result).toEqual(simple);
      expect(repo.find).toHaveBeenCalledWith({
        select: ['id', 'title', 'durationMinutes', 'posterUrl'],
        order: { title: 'ASC' },
      });
    });

    it('returns empty array when no movies', async () => {
      repo.find.mockResolvedValue([]);
      expect(await service.findAllSimple()).toEqual([]);
    });
  });

  /* ── findOne ─────────────────────────────────────────────────── */
  describe('findOne', () => {
    it('returns a movie when found', async () => {
      const movie = sampleMovie();
      repo.findOne.mockResolvedValue(movie);

      const result = await service.findOne(1);

      expect(result).toEqual(movie);
      expect(repo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('throws NotFoundException when movie does not exist', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(99)).rejects.toThrow('Movie with id 99 not found');
    });
  });

  /* ── create ──────────────────────────────────────────────────── */
  describe('create', () => {
    it('creates and returns a new movie', async () => {
      const dto = {
        title: 'Inception',
        durationMinutes: 148,
        genre: 'Sci-Fi',
        director: 'Christopher Nolan',
        releaseYear: 2010,
        description: '',
        posterUrl: '',
      };
      const created = sampleMovie();
      repo.create.mockReturnValue(created);
      repo.save.mockResolvedValue(created);

      const result = await service.create(dto as any);

      expect(repo.create).toHaveBeenCalledWith(dto);
      expect(repo.save).toHaveBeenCalledWith(created);
      expect(result).toEqual(created);
    });
  });

  /* ── update ──────────────────────────────────────────────────── */
  describe('update', () => {
    it('updates and returns the refreshed movie', async () => {
      const existing = sampleMovie();
      const updated = { ...existing, title: 'Inception 2' } as Movie;

      repo.findOne
        .mockResolvedValueOnce(existing)   // first findOne (in findOne)
        .mockResolvedValueOnce(updated);   // second findOne (return refreshed)
      repo.update.mockResolvedValue({ affected: 1 });

      const result = await service.update(1, { title: 'Inception 2' } as any);

      expect(repo.update).toHaveBeenCalledWith(1, { title: 'Inception 2' });
      expect(result).toEqual(updated);
    });

    it('throws NotFoundException when movie does not exist', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.update(99, {} as any)).rejects.toThrow(NotFoundException);
    });
  });

  /* ── remove ──────────────────────────────────────────────────── */
  describe('remove', () => {
    it('deletes movie when it exists', async () => {
      const movie = sampleMovie();
      repo.findOne.mockResolvedValue(movie);
      repo.delete.mockResolvedValue({ affected: 1 });

      await expect(service.remove(1)).resolves.toBeUndefined();
      expect(repo.delete).toHaveBeenCalledWith(1);
    });

    it('throws NotFoundException when movie does not exist', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.remove(99)).rejects.toThrow(NotFoundException);
      expect(repo.delete).not.toHaveBeenCalled();
    });
  });
});

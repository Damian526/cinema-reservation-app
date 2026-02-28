import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { MoviesController } from './movies.controller';
import { MoviesService } from './movies.service';
import { Movie } from '../entities/movie.entity';

/* ─── Mock service ───────────────────────────────────────────────── */
const mockMoviesService = () => ({
  findAll: jest.fn(),
  findAllSimple: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
});

const sampleMovie = (id = 1) =>
  ({
    id,
    title: 'Inception',
    genre: 'Sci-Fi',
    durationMinutes: 148,
    director: 'Christopher Nolan',
    releaseYear: 2010,
    posterUrl: null,
    description: '',
    createdAt: new Date(),
    updatedAt: new Date(),
  }) as unknown as Movie;

const paginatedResult = (items: Movie[]) => ({
  data: items,
  total: items.length,
  page: 1,
  limit: 20,
});

/* ─── Suite ──────────────────────────────────────────────────────── */
describe('MoviesController', () => {
  let controller: MoviesController;
  let service: ReturnType<typeof mockMoviesService>;

  beforeEach(async () => {
    service = mockMoviesService();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MoviesController],
      providers: [{ provide: MoviesService, useValue: service }],
    }).compile();

    controller = module.get<MoviesController>(MoviesController);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  /* ── GET /admin/movies ───────────────────────────────────────── */
  describe('findAll', () => {
    it('returns paginated list with default params', async () => {
      const result = paginatedResult([sampleMovie()]);
      service.findAll.mockResolvedValue(result);

      const res = await controller.findAll();

      expect(service.findAll).toHaveBeenCalledWith({
        search: undefined,
        genre: undefined,
        page: 1,
        limit: 20,
      });
      expect(res).toEqual(result);
    });

    it('passes search and genre query params to service', async () => {
      service.findAll.mockResolvedValue(paginatedResult([]));

      await controller.findAll('inception', 'Sci-Fi', '2', '5');

      expect(service.findAll).toHaveBeenCalledWith({
        search: 'inception',
        genre: 'Sci-Fi',
        page: 2,
        limit: 5,
      });
    });

    it('parses page and limit strings to numbers', async () => {
      service.findAll.mockResolvedValue(paginatedResult([]));

      await controller.findAll(undefined, undefined, '3', '15');

      expect(service.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ page: 3, limit: 15 }),
      );
    });
  });

  /* ── GET /admin/movies/all ───────────────────────────────────── */
  describe('findAllSimple', () => {
    it('returns flat array of minimal movie data', async () => {
      const simple = [{ id: 1, title: 'Inception', durationMinutes: 148, posterUrl: null }];
      service.findAllSimple.mockResolvedValue(simple);

      const res = await controller.findAllSimple();

      expect(service.findAllSimple).toHaveBeenCalledTimes(1);
      expect(res).toEqual(simple);
    });
  });

  /* ── GET /admin/movies/:id ───────────────────────────────────── */
  describe('findOne', () => {
    it('returns the movie when found', async () => {
      const movie = sampleMovie();
      service.findOne.mockResolvedValue(movie);

      const res = await controller.findOne(1);

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(res).toEqual(movie);
    });

    it('propagates NotFoundException from service', async () => {
      service.findOne.mockRejectedValue(new NotFoundException('Movie with id 99 not found'));

      await expect(controller.findOne(99)).rejects.toThrow(NotFoundException);
    });
  });

  /* ── POST /admin/movies ──────────────────────────────────────── */
  describe('create', () => {
    it('creates and returns a new movie', async () => {
      const dto = {
        title: 'Inception',
        durationMinutes: 148,
        genre: 'Sci-Fi',
        director: 'Christopher Nolan',
        releaseYear: 2010,
      };
      const created = sampleMovie();
      service.create.mockResolvedValue(created);

      const res = await controller.create(dto as any);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(res).toEqual(created);
    });
  });

  /* ── PATCH /admin/movies/:id ─────────────────────────────────── */
  describe('update', () => {
    it('updates and returns the refreshed movie', async () => {
      const updatedMovie = { ...sampleMovie(), title: 'Inception v2' } as Movie;
      service.update.mockResolvedValue(updatedMovie);

      const res = await controller.update(1, { title: 'Inception v2' } as any);

      expect(service.update).toHaveBeenCalledWith(1, { title: 'Inception v2' });
      expect(res.title).toBe('Inception v2');
    });

    it('propagates NotFoundException from service', async () => {
      service.update.mockRejectedValue(new NotFoundException());

      await expect(controller.update(99, {} as any)).rejects.toThrow(NotFoundException);
    });
  });

  /* ── DELETE /admin/movies/:id ────────────────────────────────── */
  describe('remove', () => {
    it('calls service.remove and returns undefined (204)', async () => {
      service.remove.mockResolvedValue(undefined);

      const res = await controller.remove(1);

      expect(service.remove).toHaveBeenCalledWith(1);
      expect(res).toBeUndefined();
    });

    it('propagates NotFoundException from service', async () => {
      service.remove.mockRejectedValue(new NotFoundException());

      await expect(controller.remove(99)).rejects.toThrow(NotFoundException);
    });
  });
});

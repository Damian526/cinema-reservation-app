import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Movie } from '../entities/movie.entity';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';

export interface MoviesQuery {
  search?: string;
  genre?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedMovies {
  data: Movie[];
  total: number;
  page: number;
  limit: number;
}

@Injectable()
export class MoviesService {
  constructor(
    @InjectRepository(Movie)
    private readonly moviesRepository: Repository<Movie>,
  ) {}

  async findAll(query: MoviesQuery): Promise<PaginatedMovies> {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? Math.min(query.limit, 100) : 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.search) {
      where.title = Like(`%${query.search}%`);
    }

    if (query.genre) {
      where.genre = query.genre;
    }

    const [data, total] = await this.moviesRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return { data, total, page, limit };
  }

  async findOne(id: number): Promise<Movie> {
    const movie = await this.moviesRepository.findOne({ where: { id } });
    if (!movie) {
      throw new NotFoundException(`Movie with id ${id} not found`);
    }
    return movie;
  }

  async create(dto: CreateMovieDto): Promise<Movie> {
    const movie = this.moviesRepository.create(dto);
    return this.moviesRepository.save(movie);
  }

  async update(id: number, dto: UpdateMovieDto): Promise<Movie> {
    await this.findOne(id); // throws if not found
    await this.moviesRepository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id); // throws if not found
    await this.moviesRepository.delete(id);
  }
}

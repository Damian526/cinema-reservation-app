import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Session } from '../entities/session.entity';
import { Movie } from '../entities/movie.entity';

export interface CreateSessionDto {
  movieId?: number | null;
  movieTitle: string;
  description?: string;
  startTime: string;
  endTime: string;
  totalSeats: number;
  price: number;
  roomNumber: number;
}

export interface AdminSessionsQuery {
  page?: number;
  limit?: number;
  search?: string;
  movieId?: number;
  dateFrom?: string;
  dateTo?: string;
}

export interface UpdateSessionDto {
  movieId?: number | null;
  movieTitle?: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  totalSeats?: number;
  availableSeats?: number;
  price?: number;
  roomNumber?: number;
}

@Injectable()
export class SessionsService {
  constructor(
    @InjectRepository(Session)
    private sessionRepository: Repository<Session>,
    @InjectRepository(Movie)
    private movieRepository: Repository<Movie>,
  ) {}

  private async resolveMovie(
    movieId: number | null | undefined,
    fallbackTitle: string,
  ): Promise<{ movieTitle: string; movie: Movie | null }> {
    if (movieId) {
      const movie = await this.movieRepository.findOne({ where: { id: movieId } });
      if (!movie) throw new NotFoundException(`Movie #${movieId} not found`);
      return { movieTitle: movie.title, movie };
    }
    return { movieTitle: fallbackTitle, movie: null };
  }

  async create(dto: CreateSessionDto): Promise<Session> {
    const { movieTitle, movie } = await this.resolveMovie(dto.movieId, dto.movieTitle);
    const session = this.sessionRepository.create({
      ...dto,
      movieTitle,
      movie: movie ?? undefined,
      startTime: new Date(dto.startTime),
      endTime: new Date(dto.endTime),
      availableSeats: dto.totalSeats,
    });
    return this.sessionRepository.save(session);
  }

  async findAll(): Promise<Session[]> {
    return this.sessionRepository.find({
      relations: ['movie'],
      order: { startTime: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Session | null> {
    return this.sessionRepository.findOne({ where: { id }, relations: ['movie'] });
  }

  async findAllAdmin(query: AdminSessionsQuery): Promise<{ data: Session[]; total: number }> {
    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? 20, 100);

    const qb = this.sessionRepository
      .createQueryBuilder('session')
      .leftJoinAndSelect('session.movie', 'movie')
      .orderBy('session.startTime', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    if (query.search) {
      qb.andWhere('session.movieTitle LIKE :search', { search: `%${query.search}%` });
    }
    if (query.movieId) {
      qb.andWhere('session.movieId = :movieId', { movieId: query.movieId });
    }
    if (query.dateFrom) {
      qb.andWhere('session.startTime >= :dateFrom', { dateFrom: new Date(query.dateFrom) });
    }
    if (query.dateTo) {
      qb.andWhere('session.startTime <= :dateTo', { dateTo: new Date(query.dateTo) });
    }

    const [data, total] = await qb.getManyAndCount();
    return { data, total };
  }

  async update(id: number, dto: UpdateSessionDto): Promise<Session | null> {
    const session = await this.sessionRepository.findOne({ where: { id } });
    if (!session) return null;

    const updateData: any = { ...dto };
    if (dto.movieId !== undefined) {
      const { movieTitle, movie } = await this.resolveMovie(dto.movieId, session.movieTitle);
      updateData.movieTitle = movieTitle;
      updateData.movie = movie;
    }
    if (dto.startTime) updateData.startTime = new Date(dto.startTime);
    if (dto.endTime) updateData.endTime = new Date(dto.endTime);

    Object.assign(session, updateData);
    return this.sessionRepository.save(session);
  }

  async remove(id: number): Promise<boolean> {
    const session = await this.sessionRepository.findOne({
      where: { id },
      relations: ['reservations'],
    });
    if (!session) return false;
    if (session.reservations?.length > 0) {
      throw new ConflictException('Cannot delete session with existing reservations');
    }
    const result = await this.sessionRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async bookSeats(id: number, seatsToBook: number): Promise<Session | null> {
    const session = await this.sessionRepository.findOne({ where: { id } });
    if (!session || session.availableSeats < seatsToBook) return null;
    session.availableSeats -= seatsToBook;
    return this.sessionRepository.save(session);
  }
}

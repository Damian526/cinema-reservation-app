import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Session } from '../entities/session.entity';

export interface CreateSessionDto {
  movieTitle: string;
  startTime: string;
  endTime: string;
  totalSeats: number;
  price: number;
  roomNumber: number;
}

export interface UpdateSessionDto {
  movieTitle?: string;
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
  ) {}

  async create(createSessionDto: CreateSessionDto): Promise<Session> {
    const newSession = this.sessionRepository.create({
      ...createSessionDto,
      startTime: new Date(createSessionDto.startTime),
      endTime: new Date(createSessionDto.endTime),
      availableSeats: createSessionDto.totalSeats, // Set availableSeats = totalSeats
    });

    return this.sessionRepository.save(newSession);
  }

  async findAll(): Promise<Session[]> {
    return this.sessionRepository.find({
      order: { startTime: 'ASC' }
    });
  }

  async findOne(id: number): Promise<Session | null> {
    return this.sessionRepository.findOne({ where: { id } });
  }

  async update(
    id: number,
    updateSessionDto: UpdateSessionDto,
  ): Promise<Session | null> {
    const session = await this.findOne(id);
    
    if (!session) {
      return null;
    }

    // Convert string dates to Date objects if provided
    const updateData = { ...updateSessionDto };
    if (updateData.startTime) {
      updateData.startTime = new Date(updateData.startTime) as any;
    }
    if (updateData.endTime) {
      updateData.endTime = new Date(updateData.endTime) as any;
    }

    await this.sessionRepository.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: number): Promise<boolean> {
    const result = await this.sessionRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async bookSeats(
    id: number,
    seatsToBook: number,
  ): Promise<Session | null> {
    const session = await this.findOne(id);

    if (!session || session.availableSeats < seatsToBook) {
      return null;
    }

    return this.update(id, {
      availableSeats: session.availableSeats - seatsToBook,
    });
  }
}

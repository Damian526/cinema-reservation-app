import { Injectable } from '@nestjs/common';

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

export interface Session {
  id: number;
  movieTitle: string;
  startTime: string;
  endTime: string;
  totalSeats: number;
  availableSeats: number;
  price: number;
  roomNumber: number;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class SessionsService {
  private sessions: Session[] = [];
  private nextId = 1;

  async create(createSessionDto: CreateSessionDto): Promise<Session> {
    const newSession: Session = {
      id: this.nextId++,
      ...createSessionDto,
      availableSeats: createSessionDto.totalSeats, // Set availableSeats = totalSeats
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.sessions.push(newSession);
    return newSession;
  }

  async findAll(): Promise<Session[]> {
    return this.sessions;
  }

  async findOne(id: number): Promise<Session | undefined> {
    return this.sessions.find((session) => session.id === id);
  }

  async update(
    id: number,
    updateSessionDto: UpdateSessionDto,
  ): Promise<Session | undefined> {
    const sessionIndex = this.sessions.findIndex(
      (session) => session.id === id,
    );

    if (sessionIndex === -1) {
      return undefined;
    }

    const updatedSession = {
      ...this.sessions[sessionIndex],
      ...updateSessionDto,
      updatedAt: new Date(),
    };

    this.sessions[sessionIndex] = updatedSession;
    return updatedSession;
  }

  async remove(id: number): Promise<boolean> {
    const sessionIndex = this.sessions.findIndex(
      (session) => session.id === id,
    );

    if (sessionIndex === -1) {
      return false;
    }

    this.sessions.splice(sessionIndex, 1);
    return true;
  }

  async bookSeats(
    id: number,
    seatsToBook: number,
  ): Promise<Session | undefined> {
    const session = await this.findOne(id);

    if (!session || session.availableSeats < seatsToBook) {
      return undefined;
    }

    return this.update(id, {
      availableSeats: session.availableSeats - seatsToBook,
    });
  }
}

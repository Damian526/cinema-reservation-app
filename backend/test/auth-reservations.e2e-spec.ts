import {
  HttpException,
  HttpStatus,
  INestApplication,
  UnauthorizedException,
  ValidationPipe,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AuthController } from '../src/auth/auth.controller';
import { UsersController } from '../src/users/users.controller';
import { ReservationsController } from '../src/reservations/reservations.controller';
import { AuthService } from '../src/auth/auth.service';
import { ReservationsService } from '../src/reservations/reservations.service';
import { JwtAuthGuard } from '../src/auth/jwt-auth.guard';

type TestUser = {
  id: number;
  username: string;
  email: string;
  role: string;
  createdAt: Date;
};

type TestReservation = {
  id: number;
  user: { id: number };
  session: { id: number; startTime: Date; availableSeats: number };
  seatsBooked: number;
  seatNumbers: number[];
  version: number;
};

describe('Auth + Reservations integration (e2e)', () => {
  let app: INestApplication<App>;
  let reservationsStore: TestReservation[];

  const users: TestUser[] = [
    {
      id: 1,
      username: 'user1',
      email: 'user1@example.com',
      role: 'user',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
    },
  ];

  const authServiceMock = {
    login: jest.fn(async ({ email, password }: { email: string; password: string }) => {
      if (email !== 'user1@example.com' || password !== 'Password123!') {
        throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
      }
      const user = users[0];
      return {
        access_token: `token-${user.id}`,
        user,
      };
    }),
    adminLogin: jest.fn(async () => {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }),
    register: jest.fn(async () => ({
      message: 'ok',
    })),
    findById: jest.fn(async (id: number) => users.find((u) => u.id === id)),
    updateProfile: jest.fn(),
    changePassword: jest.fn(),
  };

  const reservationsServiceMock = {
    createReservation: jest.fn(
      async (dto: { sessionId: number; seatsCount: number; seatNumbers: number[]; userId: number }) => {
        const created: TestReservation = {
          id: reservationsStore.length + 1,
          user: { id: dto.userId },
          session: {
            id: dto.sessionId,
            startTime: new Date(Date.now() + 60 * 60 * 1000),
            availableSeats: 100 - dto.seatsCount,
          },
          seatsBooked: dto.seatsCount,
          seatNumbers: dto.seatNumbers,
          version: 1,
        };
        reservationsStore.push(created);
        return created;
      },
    ),
    findAll: jest.fn(async () => reservationsStore),
    findByUserId: jest.fn(async (userId: number) =>
      reservationsStore.filter((r) => r.user.id === userId),
    ),
    findOne: jest.fn(async (id: number) => reservationsStore.find((r) => r.id === id) ?? null),
    findBySessionId: jest.fn(async (sessionId: number) =>
      reservationsStore.filter((r) => r.session.id === sessionId),
    ),
    getBookedSeatsForSession: jest.fn(async (sessionId: number) =>
      reservationsStore
        .filter((r) => r.session.id === sessionId)
        .flatMap((r) => r.seatNumbers),
    ),
    modifyReservation: jest.fn(
      async (id: number, seatNumbers: number[], expectedVersion?: number) => {
        const reservation = reservationsStore.find((r) => r.id === id);
        if (!reservation) return null;

        if (
          expectedVersion !== undefined &&
          reservation.version !== expectedVersion
        ) {
          throw new HttpException(
            `Version conflict. Reservation was modified by another user. Current version: ${reservation.version}, expected: ${expectedVersion}`,
            HttpStatus.CONFLICT,
          );
        }

        reservation.seatNumbers = seatNumbers;
        reservation.seatsBooked = seatNumbers.length;
        reservation.version += 1;
        return reservation;
      },
    ),
    cancelReservation: jest.fn(async (id: number, expectedVersion?: number) => {
      const reservation = reservationsStore.find((r) => r.id === id);
      if (!reservation) {
        throw new HttpException('Reservation not found', HttpStatus.NOT_FOUND);
      }

      if (
        expectedVersion !== undefined &&
        reservation.version !== expectedVersion
      ) {
        throw new HttpException(
          `Version conflict. Reservation was modified by another user. Current version: ${reservation.version}, expected: ${expectedVersion}`,
          HttpStatus.CONFLICT,
        );
      }

      reservationsStore = reservationsStore.filter((r) => r.id !== id);
      return { success: true };
    }),
  };

  beforeEach(async () => {
    reservationsStore = [];

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AuthController, UsersController, ReservationsController],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: ReservationsService, useValue: reservationsServiceMock },
      ],
    }).compile();

    jest.spyOn(JwtAuthGuard.prototype, 'canActivate').mockImplementation(
      (context) => {
        const req = context.switchToHttp().getRequest<{
          headers?: { cookie?: string };
          user?: {
            sub: number;
            userId: number;
            username: string;
            email: string;
            role: string;
          };
        }>();

        const cookieHeader = req.headers?.cookie ?? '';
        const tokenPair = cookieHeader
          .split(';')
          .map((part) => part.trim())
          .find((part) => part.startsWith('access_token='));
        const token = tokenPair?.split('=')[1] ?? null;

        if (!token) {
          throw new UnauthorizedException('Invalid token');
        }

        const [, userIdRaw] = token.split('-');
        const userId = Number(userIdRaw);
        if (!Number.isInteger(userId) || userId <= 0) {
          throw new UnauthorizedException('Invalid token');
        }

        req.user = {
          sub: userId,
          userId,
          username: `user${userId}`,
          email: `user${userId}@example.com`,
          role: 'user',
        };
        return true;
      },
    );

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterEach(async () => {
    await app.close();
    jest.restoreAllMocks();
  });

  it('login -> me', async () => {
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'user1@example.com', password: 'Password123!' })
      .expect(201);

    const setCookie = loginResponse.headers['set-cookie'];
    expect(Array.isArray(setCookie)).toBe(true);
    expect(setCookie[0]).toContain('access_token=token-1');

    await request(app.getHttpServer())
      .get('/users/me')
      .set('Cookie', setCookie)
      .expect(200)
      .expect((res) => {
        expect(res.body).toMatchObject({
          id: 1,
          email: 'user1@example.com',
          username: 'user1',
          role: 'user',
        });
      });
  });

  it('create reservation', async () => {
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'user1@example.com', password: 'Password123!' })
      .expect(201);

    const setCookie = loginResponse.headers['set-cookie'];

    await request(app.getHttpServer())
      .post('/reservations')
      .set('Cookie', setCookie)
      .send({
        sessionId: 10,
        seatsCount: 2,
        seatNumbers: [3, 4],
        customerName: 'John Tester',
        customerEmail: 'john.tester@example.com',
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toMatchObject({
          id: 1,
          seatsBooked: 2,
          seatNumbers: [3, 4],
          version: 1,
        });
      });
  });

  it('modify conflict returns 409 for stale expectedVersion', async () => {
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'user1@example.com', password: 'Password123!' })
      .expect(201);

    const setCookie = loginResponse.headers['set-cookie'];

    const createResponse = await request(app.getHttpServer())
      .post('/reservations')
      .set('Cookie', setCookie)
      .send({
        sessionId: 20,
        seatsCount: 2,
        seatNumbers: [7, 8],
        customerName: 'John Tester',
        customerEmail: 'john.tester@example.com',
      })
      .expect(201);

    const reservationId = createResponse.body.id;

    await request(app.getHttpServer())
      .patch(`/reservations/${reservationId}/modify`)
      .set('Cookie', setCookie)
      .send({
        seatNumbers: [9, 10],
        expectedVersion: 0,
      })
      .expect(409)
      .expect((res) => {
        expect(res.body.message).toContain('Version conflict');
      });
  });

  it('cancel conflict returns 409 for stale expectedVersion', async () => {
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'user1@example.com', password: 'Password123!' })
      .expect(201);

    const setCookie = loginResponse.headers['set-cookie'];

    const createResponse = await request(app.getHttpServer())
      .post('/reservations')
      .set('Cookie', setCookie)
      .send({
        sessionId: 21,
        seatsCount: 1,
        seatNumbers: [11],
        customerName: 'John Tester',
        customerEmail: 'john.tester@example.com',
      })
      .expect(201);

    const reservationId = createResponse.body.id;

    await request(app.getHttpServer())
      .post(`/reservations/${reservationId}/cancel`)
      .set('Cookie', setCookie)
      .send({
        expectedVersion: 0,
      })
      .expect(409)
      .expect((res) => {
        expect(res.body.message).toContain('Version conflict');
      });
  });
});

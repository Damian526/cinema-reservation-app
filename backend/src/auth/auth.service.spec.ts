import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus, UnauthorizedException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { User } from '../entities/user.entity';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;

  const mockUserRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  };

  const mockJwtService = { sign: jest.fn().mockReturnValue('mock-jwt-token') };

  const makeUser = (overrides: Partial<User> = {}) =>
    ({
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      passwordHash: 'hashed-password',
      role: 'user',
      createdAt: new Date(),
      ...overrides,
    }) as User;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => expect(service).toBeDefined());

  /* ── findByEmail ─────────────────────────────────────────────── */
  describe('findByEmail', () => {
    it('finds a user by email', async () => {
      const user = makeUser();
      mockUserRepository.findOne.mockResolvedValue(user);

      const result = await service.findByEmail('test@example.com');

      expect(result).toEqual(user);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });

    it('returns undefined when email not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      expect(await service.findByEmail('none@example.com')).toBeUndefined();
    });
  });

  /* ── findById ────────────────────────────────────────────────── */
  describe('findById', () => {
    it('returns user (without passwordHash) when found', async () => {
      const user = makeUser();
      mockUserRepository.findOne.mockResolvedValue(user);

      const result = await service.findById(1);

      expect(result).toEqual(user);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        select: ['id', 'username', 'email', 'role', 'createdAt'],
      });
    });

    it('returns undefined when user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      expect(await service.findById(99)).toBeUndefined();
    });
  });

  /* ── register ────────────────────────────────────────────────── */
  describe('register', () => {
    const dto = { username: 'newuser', email: 'new@example.com', password: 'pass123' };

    it('registers a new user and returns shaped response', async () => {
      const saved = makeUser({ username: 'newuser', email: 'new@example.com' });
      mockUserRepository.findOne
        .mockResolvedValueOnce(null)  // email not taken
        .mockResolvedValueOnce(null); // username not taken
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      mockUserRepository.create.mockReturnValue(saved);
      mockUserRepository.save.mockResolvedValue(saved);

      const result = await service.register(dto);

      expect(result.message).toBe('User registered successfully');
      expect(result.user.email).toBe('new@example.com');
      expect(result.user).not.toHaveProperty('passwordHash');
    });

    it('throws 400 when email is already taken', async () => {
      mockUserRepository.findOne.mockResolvedValueOnce(makeUser()); // email exists

      await expect(service.register(dto)).rejects.toMatchObject({
        status: HttpStatus.BAD_REQUEST,
      });
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it('throws 400 when username is already taken', async () => {
      mockUserRepository.findOne
        .mockResolvedValueOnce(null)        // email not taken
        .mockResolvedValueOnce(makeUser()); // username taken

      await expect(service.register(dto)).rejects.toMatchObject({
        status: HttpStatus.BAD_REQUEST,
      });
    });
  });

  /* ── login ───────────────────────────────────────────────────── */
  describe('login', () => {
    const dto = { email: 'test@example.com', password: 'correctpass' };

    it('returns access_token and user on valid credentials', async () => {
      const user = makeUser();
      mockUserRepository.findOne.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue('jwt-token');

      const result = await service.login(dto);

      expect(result.access_token).toBe('jwt-token');
      expect(result.user.email).toBe('test@example.com');
      expect(result.user).not.toHaveProperty('passwordHash');
    });

    it('throws 401 on wrong password', async () => {
      mockUserRepository.findOne.mockResolvedValue(makeUser());
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(dto)).rejects.toMatchObject({
        status: HttpStatus.UNAUTHORIZED,
      });
    });

    it('throws 401 when user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.login(dto)).rejects.toMatchObject({
        status: HttpStatus.UNAUTHORIZED,
      });
    });
  });

  /* ── adminLogin ──────────────────────────────────────────────── */
  describe('adminLogin', () => {
    const dto = { email: 'admin@cinema.local', password: 'Admin123!' };

    it('returns token when admin credentials are valid', async () => {
      const admin = makeUser({ role: 'admin' } as any);
      mockUserRepository.findOne.mockResolvedValue(admin);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.adminLogin(dto);

      expect(result.access_token).toBeDefined();
      expect(result.user.role).toBe('admin');
    });

    it('throws UnauthorizedException when user is not admin', async () => {
      const regular = makeUser({ role: 'user' } as any);
      mockUserRepository.findOne.mockResolvedValue(regular);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await expect(service.adminLogin(dto)).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException when password is wrong', async () => {
      mockUserRepository.findOne.mockResolvedValue(makeUser({ role: 'admin' } as any));
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.adminLogin(dto)).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException when user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.adminLogin(dto)).rejects.toThrow(UnauthorizedException);
    });
  });

  /* ── validateUser ────────────────────────────────────────────── */
  describe('validateUser', () => {
    it('returns user without passwordHash on valid credentials', async () => {
      mockUserRepository.findOne.mockResolvedValue(makeUser());
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser('test@example.com', 'correctpass');

      expect(result).not.toBeNull();
      expect(result).not.toHaveProperty('passwordHash');
    });

    it('returns null when password is wrong', async () => {
      mockUserRepository.findOne.mockResolvedValue(makeUser());
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      expect(await service.validateUser('test@example.com', 'wrong')).toBeNull();
    });

    it('returns null when user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      expect(await service.validateUser('none@example.com', 'pw')).toBeNull();
    });
  });

  /* ── updateProfile ───────────────────────────────────────────── */
  describe('updateProfile', () => {
    it('updates and returns modified user data', async () => {
      const user = makeUser();
      const updated = { ...user, username: 'newname' };
      mockUserRepository.findOne
        .mockResolvedValueOnce(user)    // current user lookup
        .mockResolvedValueOnce(null)    // username uniqueness — not taken
        .mockResolvedValueOnce(updated); // refreshed user after update
      mockUserRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.updateProfile(1, { username: 'newname' });

      expect(result.message).toBe('Profile updated successfully');
      expect(mockUserRepository.update).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ username: 'newname' }),
      );
    });

    it('throws 404 when user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.updateProfile(99, { username: 'x' })).rejects.toMatchObject({
        status: HttpStatus.NOT_FOUND,
      });
    });

    it('throws 400 when new username is already taken', async () => {
      const user = makeUser();
      mockUserRepository.findOne
        .mockResolvedValueOnce(user)         // current user
        .mockResolvedValueOnce(makeUser());  // username already taken by another user

      await expect(
        service.updateProfile(1, { username: 'taken' }),
      ).rejects.toMatchObject({ status: HttpStatus.BAD_REQUEST });
    });

    it('throws 400 when new email is already taken', async () => {
      const user = makeUser();
      mockUserRepository.findOne
        .mockResolvedValueOnce(user)         // current user
        .mockResolvedValueOnce(makeUser());  // email already taken (username not provided, check skipped)

      await expect(
        service.updateProfile(1, { email: 'taken@example.com' }),
      ).rejects.toMatchObject({ status: HttpStatus.BAD_REQUEST });
    });
  });

  /* ── changePassword ──────────────────────────────────────────── */
  describe('changePassword', () => {
    const dto = { currentPassword: 'OldPass!', newPassword: 'NewPass!' };

    it('changes password when current password is correct', async () => {
      mockUserRepository.findOne.mockResolvedValue(makeUser());
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('new-hashed');
      mockUserRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.changePassword(1, dto);

      expect(result.message).toBe('Password changed successfully');
      expect(mockUserRepository.update).toHaveBeenCalledWith(1, {
        passwordHash: 'new-hashed',
      });
    });

    it('throws 400 when current password is incorrect', async () => {
      mockUserRepository.findOne.mockResolvedValue(makeUser());
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.changePassword(1, dto)).rejects.toMatchObject({
        status: HttpStatus.BAD_REQUEST,
      });
      expect(mockUserRepository.update).not.toHaveBeenCalled();
    });

    it('throws 404 when user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.changePassword(99, dto)).rejects.toMatchObject({
        status: HttpStatus.NOT_FOUND,
      });
    });
  });
});

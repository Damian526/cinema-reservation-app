import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    adminLogin: jest.fn(),
    findById: jest.fn(),
    updateProfile: jest.fn(),
    changePassword: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  /* ── GET /auth/test ──────────────────────────────────────────── */
  describe('test', () => {
    it('returns message and timestamp', () => {
      const result = controller.test();

      expect(result).toHaveProperty('message', 'Auth controller is working');
      expect(result).toHaveProperty('timestamp');
    });
  });

  /* ── POST /auth/register ─────────────────────────────────────── */
  describe('register', () => {
    it('delegates to authService.register and returns result', async () => {
      const dto = { username: 'user', email: 'user@example.com', password: 'pass' };
      const expected = { message: 'User registered successfully', user: { id: 1 } };
      mockAuthService.register.mockResolvedValue(expected);

      const result = await controller.register(dto);

      expect(authService.register).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expected);
    });
  });

  /* ── POST /auth/login ────────────────────────────────────────── */
  describe('login', () => {
    it('returns access_token on valid credentials', async () => {
      const dto = { email: 'user@example.com', password: 'pass' };
      const expected = { access_token: 'jwt', user: { id: 1 } };
      const mockRes = { cookie: jest.fn() };
      mockAuthService.login.mockResolvedValue(expected);

      const result = await controller.login(dto, mockRes as any);

      expect(authService.login).toHaveBeenCalledWith(dto);
      expect(mockRes.cookie).toHaveBeenCalledWith('access_token', 'jwt', expect.any(Object));
      expect(result).toEqual({ access_token: 'jwt', user: { id: 1 } });
    });
  });

  /* ── POST /auth/admin-login ──────────────────────────────────── */
  describe('adminLogin', () => {
    it('returns token for valid admin credentials', async () => {
      const dto = { email: 'admin@cinema.local', password: 'Admin123!' };
      const expected = { access_token: 'admin-jwt', user: { id: 1, role: 'admin' } };
      const mockRes = { cookie: jest.fn() };
      mockAuthService.adminLogin.mockResolvedValue(expected);

      const result = await controller.adminLogin(dto, mockRes as any);

      expect(authService.adminLogin).toHaveBeenCalledWith(dto);
      expect(mockRes.cookie).toHaveBeenCalledWith('access_token', 'admin-jwt', expect.any(Object));
      expect(result).toEqual({ access_token: 'admin-jwt', user: { id: 1, role: 'admin' } });
    });

    it('propagates UnauthorizedException from service', async () => {
      const mockRes = { cookie: jest.fn() };
      mockAuthService.adminLogin.mockRejectedValue(
        new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED),
      );

      await expect(
        controller.adminLogin({ email: 'x@x.com', password: 'bad' }, mockRes as any),
      ).rejects.toThrow(HttpException);
    });
  });

  /* ── GET /auth/profile ───────────────────────────────────────── */
  describe('getProfile', () => {
    it('returns { user } when authenticated user exists', async () => {
      const req = { user: { sub: 1 } };
      const userData = { id: 1, username: 'testuser', email: 'test@example.com' };
      mockAuthService.findById.mockResolvedValue(userData);

      const result = await controller.getProfile(req);

      expect(authService.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual({ user: userData });
    });

    it('throws 404 when authenticated user is not found in DB', async () => {
      const req = { user: { sub: 99 } };
      mockAuthService.findById.mockResolvedValue(undefined);

      await expect(controller.getProfile(req)).rejects.toThrow(
        new HttpException('User not found', HttpStatus.NOT_FOUND),
      );
    });
  });

  /* ── GET /auth/test-auth ─────────────────────────────────────── */
  describe('testAuth', () => {
    it('returns success message and the request user payload', () => {
      const req = { user: { sub: 1, username: 'testuser', role: 'user' } };

      const result = controller.testAuth(req);

      expect(result).toEqual({
        message: 'Authentication successful',
        user: req.user,
      });
    });
  });

  /* ── PUT /auth/profile ───────────────────────────────────────── */
  describe('updateProfile', () => {
    it('delegates to authService.updateProfile with correct userId', async () => {
      const req = { user: { sub: 1 } };
      const dto = { username: 'newname' };
      const expected = { message: 'Profile updated successfully', user: { id: 1 } };
      mockAuthService.updateProfile.mockResolvedValue(expected);

      const result = await controller.updateProfile(req, dto);

      expect(authService.updateProfile).toHaveBeenCalledWith(1, dto);
      expect(result).toEqual(expected);
    });
  });

  /* ── PUT /auth/change-password ───────────────────────────────── */
  describe('changePassword', () => {
    it('delegates to authService.changePassword with correct userId', async () => {
      const req = { user: { sub: 1 } };
      const dto = { currentPassword: 'Old!', newPassword: 'New!' };
      const expected = { message: 'Password changed successfully' };
      mockAuthService.changePassword.mockResolvedValue(expected);

      const result = await controller.changePassword(req, dto);

      expect(authService.changePassword).toHaveBeenCalledWith(1, dto);
      expect(result).toEqual(expected);
    });

    it('propagates HttpException from service (wrong current password)', async () => {
      const req = { user: { sub: 1 } };
      mockAuthService.changePassword.mockRejectedValue(
        new HttpException('Current password is incorrect', HttpStatus.BAD_REQUEST),
      );

      await expect(
        controller.changePassword(req, { currentPassword: 'bad', newPassword: 'new' }),
      ).rejects.toThrow(HttpException);
    });
  });

  /* ── POST /auth/logout ───────────────────────────────────────── */
  describe('logout', () => {
    it('clears access_token cookie and returns success message', () => {
      const mockRes = { clearCookie: jest.fn() };

      const result = controller.logout(mockRes as any);

      expect(mockRes.clearCookie).toHaveBeenCalledWith('access_token', { httpOnly: true, sameSite: 'lax' });
      expect(result).toEqual({ message: 'Logged out successfully' });
    });
  });
});

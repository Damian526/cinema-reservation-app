import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UsersController } from './users.controller';
import { AuthService } from '../auth/auth.service';
import type { AuthenticatedRequest } from '../auth/authenticated-request.interface';

describe('UsersController', () => {
  let controller: UsersController;
  let authService: AuthService;

  const mockAuthService = {
    findById: jest.fn().mockResolvedValue({
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      role: 'user',
      createdAt: new Date(),
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return user profile', async () => {
    const mockRequest = {
      user: {
        sub: 1,
        userId: 1,
        username: 'testuser',
        email: 'test@example.com',
        role: 'user',
      },
    } as unknown as AuthenticatedRequest;

    const result = await controller.getMe(mockRequest);

    expect(authService.findById).toHaveBeenCalledWith(1);
    expect(result).toEqual({
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      role: 'user',
      createdAt: expect.any(Date),
    });
  });

  it('should throw NOT_FOUND when user does not exist', async () => {
    mockAuthService.findById.mockResolvedValueOnce(null);

    const mockRequest = {
      user: {
        sub: 999,
        userId: 999,
        username: 'missing-user',
        email: 'missing@example.com',
        role: 'user',
      },
    } as unknown as AuthenticatedRequest;

    await expect(controller.getMe(mockRequest)).rejects.toThrow(
      new NotFoundException('User not found'),
    );
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { AuthService } from '../auth/auth.service';

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
        username: 'testuser',
        email: 'test@example.com',
        role: 'user',
      },
    };

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
});

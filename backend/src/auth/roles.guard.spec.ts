import { ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { Role } from './role.enum';

describe('RolesGuard', () => {
  const reflector = {
    getAllAndOverride: jest.fn(),
  } as unknown as Reflector;
  let guard: RolesGuard;

  const makeContext = (user?: { role?: string }) =>
    ({
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
    }) as never;

  beforeEach(() => {
    guard = new RolesGuard(reflector);
    jest.clearAllMocks();
  });

  it('should allow access when no roles metadata is set', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(undefined);
    expect(guard.canActivate(makeContext({ role: Role.User }))).toBe(true);
  });

  it('should throw when user is missing for a protected route', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue([Role.Admin]);
    expect(() => guard.canActivate(makeContext(undefined))).toThrow(
      new ForbiddenException('Access denied'),
    );
  });

  it('should throw when user lacks required role', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue([Role.Admin]);
    expect(() => guard.canActivate(makeContext({ role: Role.User }))).toThrow(
      new ForbiddenException(
        'You do not have permission to access this resource',
      ),
    );
  });

  it('should allow when user has required role', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue([Role.Admin]);
    expect(guard.canActivate(makeContext({ role: Role.Admin }))).toBe(true);
  });
});

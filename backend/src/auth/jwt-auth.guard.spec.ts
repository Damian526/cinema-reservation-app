import { UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;

  beforeEach(() => {
    guard = new JwtAuthGuard();
  });

  it('should return user from handleRequest when user is present', () => {
    const user = { sub: 1, userId: 1, role: 'user' };
    expect(guard.handleRequest(null, user)).toBe(user);
  });

  it('should throw UnauthorizedException when user is missing', () => {
    expect(() => guard.handleRequest(null, null)).toThrow(
      new UnauthorizedException('Invalid token'),
    );
  });

  it('should rethrow original error from handleRequest', () => {
    const error = new Error('jwt malformed');
    expect(() => guard.handleRequest(error, null)).toThrow(error);
  });

  it('should delegate canActivate to parent AuthGuard', () => {
    const parent = Object.getPrototypeOf(JwtAuthGuard.prototype) as {
      canActivate: (ctx: unknown) => boolean;
    };
    const spy = jest.spyOn(parent, 'canActivate').mockReturnValue(true);
    const context = {} as never;

    expect(guard.canActivate(context)).toBe(true);
    expect(spy).toHaveBeenCalledWith(context);
  });
});

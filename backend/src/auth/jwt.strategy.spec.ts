import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  beforeEach(() => {
    strategy = new JwtStrategy();
  });

  it('should extract token from cookie first', () => {
    const extractor = (strategy as unknown as { _jwtFromRequest: (req: unknown) => string | null })._jwtFromRequest;
    const token = extractor({
      cookies: { access_token: 'cookie-token' },
      headers: { authorization: 'Bearer header-token' },
    });

    expect(token).toBe('cookie-token');
  });

  it('should fallback to bearer token when cookie is missing', () => {
    const extractor = (strategy as unknown as { _jwtFromRequest: (req: unknown) => string | null })._jwtFromRequest;
    const token = extractor({
      headers: { authorization: 'Bearer header-token' },
    });

    expect(token).toBe('header-token');
  });

  it('should map payload fields in validate', () => {
    const payload = {
      sub: 7,
      username: 'alice',
      email: 'alice@example.com',
      role: 'admin',
    };

    expect(strategy.validate(payload)).toEqual({
      sub: 7,
      userId: 7,
      username: 'alice',
      email: 'alice@example.com',
      role: 'admin',
    });
  });
});

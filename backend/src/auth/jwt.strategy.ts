import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'secret',
    });
  }

  async validate(payload: any) {
    console.log('🔑 JWT Strategy validate called:');
    console.log('  - Payload:', payload);
    
    const user = {
      userId: payload.sub,
      username: payload.username,
      email: payload.email,
      role: payload.role,
    };
    
    console.log('  - Validated user:', user);
    return user;
  }
}

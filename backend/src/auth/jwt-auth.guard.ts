import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    console.log('🔐 JWT Auth Guard activated');
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    console.log('  - Authorization header:', authHeader ? `${authHeader.substring(0, 20)}...` : 'missing');
    
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    console.log('🔐 JWT Auth Guard handleRequest:');
    console.log('  - Error:', err);
    console.log('  - User:', user);
    console.log('  - Info:', info);
    
    if (err || !user) {
      console.log('  ❌ Authentication failed');
      throw err || new UnauthorizedException('Invalid token');
    }
    
    console.log('  ✅ Authentication successful');
    return user;
  }
}

import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthService, RegisterDto, LoginDto } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('test')
  test() {
    return { message: 'Auth controller is working', timestamp: new Date() };
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    console.log('Login attempt with:', loginDto);
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  @UseGuards(JwtAuthGuard)
  @Get('test-auth')
  testAuth(@Request() req) {
    console.log('🧪 Test auth endpoint called');
    console.log('  - User from JWT:', req.user);
    return { message: 'Authentication successful', user: req.user };
  }
}

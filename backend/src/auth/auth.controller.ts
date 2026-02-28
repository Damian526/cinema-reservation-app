import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  UseGuards,
  Request,
  Response,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response as Res } from 'express';
import { AuthService, RegisterDto, LoginDto, AdminLoginDto, UpdateProfileDto, ChangePasswordDto } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

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
  async login(
    @Body() loginDto: LoginDto,
    @Response({ passthrough: true }) res: Res,
  ) {
    const result = await this.authService.login(loginDto);
    res.cookie('access_token', result.access_token, COOKIE_OPTIONS);
    // access_token included in body for mobile clients (store in Keychain/Keystore, NOT localStorage)
    return { access_token: result.access_token, user: result.user };
  }

  @Post('admin-login')
  async adminLogin(
    @Body() adminLoginDto: AdminLoginDto,
    @Response({ passthrough: true }) res: Res,
  ) {
    const result = await this.authService.adminLogin(adminLoginDto);
    res.cookie('access_token', result.access_token, COOKIE_OPTIONS);
    // access_token included in body for mobile clients (store in Keychain/Keystore, NOT localStorage)
    return { access_token: result.access_token, user: result.user };
  }

  @Post('logout')
  logout(@Response({ passthrough: true }) res: Res) {
    res.clearCookie('access_token', { httpOnly: true, sameSite: 'lax' });
    return { message: 'Logged out successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    const userId = req.user.sub;
    const user = await this.authService.findById(userId);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return { user };
  }

  @UseGuards(JwtAuthGuard)
  @Get('test-auth')
  testAuth(@Request() req) {
    return { message: 'Authentication successful', user: req.user };
  }

  @UseGuards(JwtAuthGuard)
  @Put('profile')
  async updateProfile(@Request() req, @Body() updateProfileDto: UpdateProfileDto) {
    const userId = req.user.sub;
    return this.authService.updateProfile(userId, updateProfileDto);
  }

  @UseGuards(JwtAuthGuard)
  @Put('change-password')
  async changePassword(@Request() req, @Body() changePasswordDto: ChangePasswordDto) {
    const userId = req.user.sub;
    return this.authService.changePassword(userId, changePasswordDto);
  }

}

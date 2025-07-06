import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  UseGuards,
  Request,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AuthService, RegisterDto, LoginDto, UpdateProfileDto, ChangePasswordDto } from './auth.service';
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
    return this.authService.login(loginDto);
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

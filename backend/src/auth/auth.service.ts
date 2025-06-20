import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

export interface RegisterDto {
  username: string;
  email: string;
  password: string;
}

export interface LoginDto {
  username: string;
  password: string;
}

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async register(registerDto: RegisterDto) {
    const { username, email, password } = registerDto;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // In a real app, you would save to database here
    // For now, just return success message

    return {
      message: 'User registered successfully',
      user: { username, email },
    };
  }

  async login(loginDto: LoginDto) {
    const { username, password } = loginDto;

    // In a real app, you would validate against database
    // For now, simple validation
    if (username && password) {
      const payload = { username, sub: 1 };
      return {
        access_token: this.jwtService.sign(payload),
        user: { username },
      };
    }

    throw new Error('Invalid credentials');
  }

  async validateUser(username: string, password: string): Promise<any> {
    // In a real app, you would validate against database
    if (username && password) {
      return { userId: 1, username };
    }
    return null;
  }
}

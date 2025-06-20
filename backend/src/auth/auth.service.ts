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

export interface User {
  id: number;
  username: string;
  email: string;
  password?: string;
}

@Injectable()
export class AuthService {
  // Mock users database - in real app this would be a database
  private users: User[] = [
    {
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      password: '$2b$10$hash...', // hashed password
    },
  ];

  constructor(private jwtService: JwtService) {}

  async findByEmail(email: string): Promise<User | undefined> {
    return this.users.find((user) => user.email === email);
  }

  async findById(id: number): Promise<User | undefined> {
    const user = this.users.find((user) => user.id === id);
    if (user) {
      // Remove password from returned user object
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }
    return undefined;
  }

  async register(registerDto: RegisterDto) {
    const { username, email, password } = registerDto;

    // Check if user already exists
    const existingUser = await this.findByEmail(email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser: User = {
      id: this.users.length + 1,
      username,
      email,
      password: hashedPassword,
    };

    this.users.push(newUser);

    return {
      message: 'User registered successfully',
      user: { id: newUser.id, username, email },
    };
  }

  async login(loginDto: LoginDto) {
    const { username, password } = loginDto;

    // Find user by username or email
    const user = this.users.find(
      (u) => u.username === username || u.email === username,
    );

    if (user && (await bcrypt.compare(password, user.password))) {
      const payload = {
        username: user.username,
        sub: user.id,
        email: user.email,
      };
      return {
        access_token: this.jwtService.sign(payload),
        user: { id: user.id, username: user.username, email: user.email },
      };
    }

    throw new Error('Invalid credentials');
  }

  async validateUser(username: string, password: string): Promise<any> {
    const user = this.users.find(
      (u) => u.username === username || u.email === username,
    );
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }
}

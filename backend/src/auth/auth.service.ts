import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import * as bcrypt from 'bcrypt';

export interface RegisterDto {
  username: string;
  email: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async findByEmail(email: string): Promise<User | undefined> {
    const user = await this.userRepository.findOne({ where: { email } });
    return user || undefined;
  }

  async findById(id: number): Promise<User | undefined> {
    const user = await this.userRepository.findOne({
      where: { id },
      select: ['id', 'username', 'email', 'role', 'createdAt'], // Exclude passwordHash
    });
    return user || undefined;
  }

  async register(registerDto: RegisterDto) {
    try {
      console.log('=== REGISTER DEBUG ===');
      console.log(
        'Received registerDto:',
        JSON.stringify(registerDto, null, 2),
      );
      console.log('Type of registerDto:', typeof registerDto);
      console.log('Keys in registerDto:', Object.keys(registerDto || {}));

      const { username, email, password } = registerDto;

      console.log('Extracted values:');
      console.log('- username:', username, '(type:', typeof username, ')');
      console.log('- email:', email, '(type:', typeof email, ')');
      console.log('- password:', password, '(type:', typeof password, ')');

      // Check if user already exists by email
      const existingUserByEmail = await this.findByEmail(email);
      if (existingUserByEmail) {
        console.log(
          'User with email already exists:',
          existingUserByEmail.email,
        );
        throw new HttpException(
          'User with this email already exists',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Check if username already exists
      const existingUserByUsername = await this.userRepository.findOne({
        where: { username },
      });
      if (existingUserByUsername) {
        console.log(
          'User with username already exists:',
          existingUserByUsername.username,
        );
        throw new HttpException(
          'User with this username already exists',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);

      // Create new user
      const newUser = this.userRepository.create({
        username,
        email,
        passwordHash,
        role: 'user',
      });

      const savedUser = await this.userRepository.save(newUser);
      console.log('User created successfully:', savedUser.id);

      return {
        message: 'User registered successfully',
        user: {
          id: savedUser.id,
          username: savedUser.username,
          email: savedUser.email,
          role: savedUser.role,
          createdAt: savedUser.createdAt,
        },
      };
    } catch (error) {
      console.error('Registration error:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Internal server error during registration',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async login(loginDto: LoginDto) {
    console.log('=== LOGIN DEBUG ===');
    console.log('LoginDto received:', loginDto);
    
    const { email, password } = loginDto;
    console.log('Extracted email:', email);
    console.log('Extracted password:', password);
    console.log('Password type:', typeof password);
    console.log('Password length:', password?.length);

    // Find user by email
    const user = await this.userRepository.findOne({
      where: { email: email },
      select: ['id', 'username', 'email', 'passwordHash', 'role', 'createdAt'],
    });

    console.log('User found:', user ? 'YES' : 'NO');
    if (user) {
      console.log('=== EMAIL COMPARISON ===');
      console.log('Searched email:', email);
      console.log('Found user email:', user.email);
      console.log('Emails match:', email === user.email);
      
      console.log('=== PASSWORD COMPARISON ===');
      console.log('Plain text password from request:', password);
      console.log('Plain text password type:', typeof password);
      console.log('Plain text password length:', password.length);
      console.log('Stored passwordHash from DB:', user.passwordHash);
      console.log('Stored passwordHash type:', typeof user.passwordHash);
      console.log('Stored passwordHash length:', user.passwordHash.length);
      console.log('Passwords are same string:', password === user.passwordHash);
      
      console.log('Attempting bcrypt comparison...');
      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      console.log('Password comparison result:', isPasswordValid);
    }

    if (user && (await bcrypt.compare(password, user.passwordHash))) {
      const payload = {
        username: user.username,
        email: user.email,
        sub: user.id,
        role: user.role,
      };
      return {
        access_token: this.jwtService.sign(payload),
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
        },
      };
    }

    throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { email },
      select: ['id', 'username', 'email', 'passwordHash', 'role', 'createdAt'],
    });

    if (user && (await bcrypt.compare(password, user.passwordHash))) {
      const { passwordHash, ...result } = user;
      return result;
    }
    return null;
  }
}

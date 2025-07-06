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

export interface UpdateProfileDto {
  username?: string;
  email?: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
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
      const { username, email, password } = registerDto;

      // Check if user already exists by email
      const existingUserByEmail = await this.findByEmail(email);
      if (existingUserByEmail) {
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
    const { email, password } = loginDto;

    // Find user by email
    const user = await this.userRepository.findOne({
      where: { email: email },
      select: ['id', 'username', 'email', 'passwordHash', 'role', 'createdAt'],
    });

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
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { passwordHash, ...result } = user;
      return result;
    }
    return null;
  }

  async updateProfile(userId: number, updateProfileDto: UpdateProfileDto) {
    try {
      const { username, email } = updateProfileDto;

      // Get current user
      const currentUser = await this.userRepository.findOne({
        where: { id: userId },
        select: ['id', 'username', 'email', 'role', 'createdAt'],
      });

      if (!currentUser) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      // Check if new username is already taken (if provided and different)
      if (username && username !== currentUser.username) {
        const existingUserByUsername = await this.userRepository.findOne({
          where: { username },
        });
        if (existingUserByUsername) {
          throw new HttpException(
            'Username is already taken',
            HttpStatus.BAD_REQUEST,
          );
        }
      }

      // Check if new email is already taken (if provided and different)
      if (email && email !== currentUser.email) {
        const existingUserByEmail = await this.userRepository.findOne({
          where: { email },
        });
        if (existingUserByEmail) {
          throw new HttpException(
            'Email is already taken',
            HttpStatus.BAD_REQUEST,
          );
        }
      }

      // Update user
      const updateData: Partial<User> = {};
      if (username) updateData.username = username;
      if (email) updateData.email = email;

      if (Object.keys(updateData).length > 0) {
        await this.userRepository.update(userId, updateData);
      }

      // Return updated user data
      const updatedUser = await this.userRepository.findOne({
        where: { id: userId },
        select: ['id', 'username', 'email', 'role', 'createdAt'],
      });

      return {
        message: 'Profile updated successfully',
        user: updatedUser,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Internal server error during profile update',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async changePassword(userId: number, changePasswordDto: ChangePasswordDto) {
    try {
      const { currentPassword, newPassword } = changePasswordDto;

      // Get user with password hash
      const user = await this.userRepository.findOne({
        where: { id: userId },
        select: [
          'id',
          'username',
          'email',
          'passwordHash',
          'role',
          'createdAt',
        ],
      });

      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(
        currentPassword,
        user.passwordHash,
      );
      if (!isCurrentPasswordValid) {
        throw new HttpException(
          'Current password is incorrect',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Hash new password
      const newPasswordHash = await bcrypt.hash(newPassword, 10);

      // Update password
      await this.userRepository.update(userId, {
        passwordHash: newPasswordHash,
      });

      return {
        message: 'Password changed successfully',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Internal server error during password change',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

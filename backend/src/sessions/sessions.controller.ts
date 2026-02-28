import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import {
  SessionsService,
  CreateSessionDto,
  UpdateSessionDto,
} from './sessions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/role.enum';

@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Post()
  async create(@Body() createSessionDto: CreateSessionDto) {
    return this.sessionsService.create(createSessionDto);
  }

  @Get()
  async findAll() {
    return this.sessionsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const session = await this.sessionsService.findOne(id);

    if (!session) {
      throw new HttpException('Session not found', HttpStatus.NOT_FOUND);
    }

    return session;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSessionDto: UpdateSessionDto,
  ) {
    const session = await this.sessionsService.update(id, updateSessionDto);

    if (!session) {
      throw new HttpException('Session not found', HttpStatus.NOT_FOUND);
    }

    return session;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    const deleted = await this.sessionsService.remove(id);

    if (!deleted) {
      throw new HttpException('Session not found', HttpStatus.NOT_FOUND);
    }

    return { message: 'Session deleted successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/book')
  async bookSeats(
    @Param('id', ParseIntPipe) id: number,
    @Body('seatsToBook', ParseIntPipe) seatsToBook: number,
  ) {
    const session = await this.sessionsService.bookSeats(id, seatsToBook);

    if (!session) {
      throw new HttpException(
        'Session not found or not enough available seats',
        HttpStatus.BAD_REQUEST,
      );
    }

    return session;
  }
}

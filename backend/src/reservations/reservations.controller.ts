import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  ParseIntPipe,
  HttpException,
  HttpStatus,
  Patch,
} from '@nestjs/common';
import {
  ReservationsService,
} from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { ModifyReservationDto } from './dto/modify-reservation.dto';
import { CancelReservationDto } from './dto/cancel-reservation.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthenticatedRequest } from '../auth/authenticated-request.interface';

@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createReservation(
    @Body() createReservationDto: CreateReservationDto,
    @Request() req: AuthenticatedRequest,
  ) {
    const reservationData = {
      ...createReservationDto,
      userId: req.user.userId,
    };

    return this.reservationsService.createReservation(reservationData);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll() {
    return this.reservationsService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('my')
  async findMyReservations(@Request() req: AuthenticatedRequest) {
    return this.reservationsService.findByUserId(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const reservation = await this.reservationsService.findOne(id);

    if (!reservation) {
      throw new HttpException('Reservation not found', HttpStatus.NOT_FOUND);
    }

    return reservation;
  }

  @Get('session/:sessionId')
  async findBySession(@Param('sessionId', ParseIntPipe) sessionId: number) {
    return this.reservationsService.findBySessionId(sessionId);
  }

  @Get('session/:sessionId/booked-seats')
  async getBookedSeats(@Param('sessionId', ParseIntPipe) sessionId: number) {
    return {
      sessionId,
      bookedSeats: await this.reservationsService.getBookedSeatsForSession(sessionId),
    };
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/modify')
  async modifyReservation(
    @Param('id', ParseIntPipe) id: number,
    @Body() modifyData: ModifyReservationDto,
    @Request() req: AuthenticatedRequest,
  ) {
    const reservation = await this.reservationsService.findOne(id);

    if (!reservation) {
      throw new HttpException('Reservation not found', HttpStatus.NOT_FOUND);
    }

    if (reservation.user.id !== req.user.userId) {
      throw new HttpException(
        'You can only modify your own reservations',
        HttpStatus.FORBIDDEN,
      );
    }

    const sessionStartTime = new Date(reservation.session.startTime);
    if (sessionStartTime <= new Date()) {
      throw new HttpException(
        'Cannot modify reservation for a session that has already started',
        HttpStatus.BAD_REQUEST,
      );
    }

    const modifiedReservation = await this.reservationsService.modifyReservation(
      id,
      modifyData.seatNumbers,
      modifyData.expectedVersion,
    );

    if (!modifiedReservation) {
      throw new HttpException(
        'Failed to modify reservation',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return modifiedReservation;
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/details')
  async getReservationDetails(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: AuthenticatedRequest,
  ) {
    const reservation = await this.reservationsService.findOne(id);

    if (!reservation) {
      throw new HttpException('Reservation not found', HttpStatus.NOT_FOUND);
    }

    if (reservation.user.id !== req.user.userId) {
      throw new HttpException(
        'You can only view your own reservations',
        HttpStatus.FORBIDDEN,
      );
    }

    return reservation;
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/cancel')
  async cancelReservation(
    @Param('id', ParseIntPipe) id: number,
    @Body() cancelData: CancelReservationDto,
    @Request() req: AuthenticatedRequest,
  ) {
    const reservation = await this.reservationsService.findOne(id);

    if (!reservation) {
      throw new HttpException('Reservation not found', HttpStatus.NOT_FOUND);
    }

    if (reservation.user.id !== req.user.userId) {
      throw new HttpException(
        'You can only cancel your own reservations',
        HttpStatus.FORBIDDEN,
      );
    }

    return this.reservationsService.cancelReservation(
      id,
      cancelData.expectedVersion,
    );
  }
}

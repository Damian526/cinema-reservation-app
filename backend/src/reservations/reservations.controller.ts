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
  CreateReservationDto,
} from './reservations.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createReservation(
    @Body() createReservationDto: CreateReservationDto,
    @Request() req,
  ) {
    // Use authenticated user's ID
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
  async findMyReservations(@Request() req) {
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
  @Patch(':id/cancel')
  async cancelReservation(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
  ) {
    const reservation = await this.reservationsService.findOne(id);

    if (!reservation) {
      throw new HttpException('Reservation not found', HttpStatus.NOT_FOUND);
    }

    // Check if user owns the reservation
    if (reservation.user.id !== req.user.userId) {
      throw new HttpException(
        'You can only cancel your own reservations',
        HttpStatus.FORBIDDEN,
      );
    }

    const cancelledReservation =
      await this.reservationsService.cancelReservation(id);

    if (!cancelledReservation) {
      throw new HttpException(
        'Failed to cancel reservation',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return cancelledReservation;
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/modify')
  async modifyReservation(
    @Param('id', ParseIntPipe) id: number,
    @Body() modifyData: { seatNumbers: number[] },
    @Request() req,
  ) {
    const reservation = await this.reservationsService.findOne(id);

    if (!reservation) {
      throw new HttpException('Reservation not found', HttpStatus.NOT_FOUND);
    }

    // Check if user owns the reservation
    if (reservation.user.id !== req.user.userId) {
      throw new HttpException(
        'You can only modify your own reservations',
        HttpStatus.FORBIDDEN,
      );
    }

    // Check if session hasn't started yet
    const sessionStartTime = new Date(reservation.session.startTime);
    const now = new Date();
    if (sessionStartTime <= now) {
      throw new HttpException(
        'Cannot modify reservation for a session that has already started',
        HttpStatus.BAD_REQUEST,
      );
    }

    const modifiedReservation = await this.reservationsService.modifyReservation(
      id,
      modifyData.seatNumbers,
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
    @Request() req,
  ) {
    const reservation = await this.reservationsService.findOne(id);

    if (!reservation) {
      throw new HttpException('Reservation not found', HttpStatus.NOT_FOUND);
    }

    // Check if user owns the reservation
    if (reservation.user.id !== req.user.userId) {
      throw new HttpException(
        'You can only view your own reservations',
        HttpStatus.FORBIDDEN,
      );
    }

    return reservation;
  }
}

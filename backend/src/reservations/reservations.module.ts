import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReservationsService } from './reservations.service';
import { ReservationsController } from './reservations.controller';
import { SessionsModule } from '../sessions/sessions.module';
import { Reservation } from '../entities/reservation.entity';
import { User } from '../entities/user.entity';
import { Session } from '../entities/session.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Reservation, User, Session]),
    SessionsModule
  ],
  controllers: [ReservationsController],
  providers: [ReservationsService],
  exports: [ReservationsService],
})
export class ReservationsModule {}

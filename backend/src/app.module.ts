import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SessionsModule } from './sessions/sessions.module';
import { ReservationsModule } from './reservations/reservations.module';
import { ReservationsController } from './reservations/reservations.controller';

import { AppDataSource } from './data-source';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MoviesModule } from './movies/movies.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(AppDataSource.options),
    AuthModule,
    UsersModule,
    SessionsModule,
    ReservationsModule,
    MoviesModule,
  ],
  controllers: [ReservationsController],
})
export class AppModule {}

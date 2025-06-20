import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SessionsModule } from './sessions/sessions.module';
import { ReservationsController } from './reservations/reservations.controller';
import { ReservationsModule } from './reservations/reservations.module';

import { AppDataSource } from './data-source';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SessionsModule } from './sessions/sessions.module';

@Module({
  imports: [
    // Ładuje pełną konfigurację z DataSource
    TypeOrmModule.forRoot(AppDataSource.options),

    // Feature-modules
    AuthModule,
    UsersModule,
    SessionsModule,
    ReservationsModule,
  ],
  controllers: [ReservationsController],
})
export class AppModule {}

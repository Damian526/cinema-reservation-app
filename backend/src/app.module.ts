import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SessionsModule } from './sessions/sessions.module';
import { ReservationsModule } from './reservations/reservations.module';

import { AppDataSource } from './data-source';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';

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
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SessionsService } from './sessions.service';
import { SessionsController } from './sessions.controller';
import { AdminSessionsController } from './admin-sessions.controller';
import { Session } from '../entities/session.entity';
import { Movie } from '../entities/movie.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Session, Movie])],
  controllers: [SessionsController, AdminSessionsController],
  providers: [SessionsService],
  exports: [SessionsService],
})
export class SessionsModule {}

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3307, // Twoje mapowanie 3307:3306
      username: 'kino_user',
      password: 'UserPass123',
      database: 'kino',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      migrations: [__dirname + '/migrations/*{.ts,.js}'],
      synchronize: false, // migracje zamiast auto-schematu
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

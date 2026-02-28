import 'dotenv/config';
import { DataSource } from 'typeorm';
import { User } from './entities/user.entity';
import { Session } from './entities/session.entity';
import { Reservation } from './entities/reservation.entity';
import { Movie } from './entities/movie.entity';

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST ?? 'localhost',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
  username: process.env.DB_USERNAME ?? 'root',
  password: process.env.DB_PASSWORD ?? '',
  database: process.env.DB_DATABASE ?? 'kino',
  entities: [User, Session, Reservation, Movie],
  migrations: [
    __dirname.includes('dist')
      ? __dirname + '/migrations/*.js'
      : 'src/migrations/*.ts',
  ],
  migrationsTableName: 'migrations',
  synchronize: false,
});

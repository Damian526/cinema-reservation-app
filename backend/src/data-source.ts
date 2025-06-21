import { DataSource } from 'typeorm';
import { User } from './entities/user.entity';
import { Session } from './entities/session.entity';
import { Reservation } from './entities/reservation.entity';

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST ?? 'localhost',
  port: 3307,
  username: process.env.DB_USER ?? 'kino_user',
  password: process.env.DB_PASS ?? 'UserPass123',
  database: process.env.DB_NAME ?? 'kino',
  entities: [User, Session, Reservation],
  migrations: [
    __dirname.includes('dist')
      ? __dirname + '/migrations/*.js'
      : 'src/migrations/*.ts',
  ],
  migrationsTableName: 'migrations',
  synchronize: false,
});

import { DataSource } from 'typeorm';
import { User } from './entities/user.entity';
import { Session } from './entities/session.entity';
import { Reservation } from './entities/reservation.entity';

// 🙂 Upewnij się, że ścieżki do encji są poprawne względem lokalizacji pliku seeder.ts

async function seed() {
  const ds = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST ?? 'localhost',
    port: 3307,
    username: process.env.DB_USER ?? 'kino_user',
    password: process.env.DB_PASS ?? 'UserPass123',
    database: process.env.DB_NAME ?? 'kino',
    entities: [User, Session, Reservation],
  });
  await ds.initialize();

  const uRepo = ds.getRepository(User);
  const sRepo = ds.getRepository(Session);

  // 1) Admin
  const admin = uRepo.create({
    username: 'admin',
    email: 'admin@kino.local',
    passwordHash: 'HASHED_PASSWORD_HERE', // <- podmień na bcrypt.hashSync('twoje_haslo', salt)
    role: 'admin',
  });
  await uRepo.save(admin);
  console.log('✔ Admin user created');

  // 2) Przykładowe seanse
  const now = Date.now();
  const sessions = [
    sRepo.create({
      movieTitle: 'Matrix',
      startTime: new Date(now + 60 * 60 * 1000), // za 1h
      totalSeats: 100,
      availableSeats: 100,
    }),
    sRepo.create({
      movieTitle: 'Incepcja',
      startTime: new Date(now + 2 * 60 * 60 * 1000), // za 2h
      totalSeats: 80,
      availableSeats: 80,
    }),
    sRepo.create({
      movieTitle: 'Interstellar',
      startTime: new Date(now + 3 * 60 * 60 * 1000), // za 3h
      totalSeats: 120,
      availableSeats: 120,
    }),
  ];
  await sRepo.save(sessions);
  console.log(`✔ ${sessions.length} sessions created`);

  await ds.destroy();
  console.log('🎉 Seeding completed');
}

seed().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});

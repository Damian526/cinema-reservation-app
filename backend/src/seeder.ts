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
  const rRepo = ds.getRepository(Reservation);

  // 1) Admin - check if exists first
  let admin = await uRepo.findOne({ where: { email: 'admin@kino.local' } });
  if (!admin) {
    admin = uRepo.create({
      username: 'admin',
      email: 'admin@kino.local',
      passwordHash: 'HASHED_PASSWORD_HERE', // <- podmień na bcrypt.hashSync('twoje_haslo', salt)
      role: 'admin',
    });
    await uRepo.save(admin);
    console.log('✔ Admin user created');
  } else {
    console.log('✔ Admin user already exists');
  }

  // 2) Clear existing data in correct order (reservations first, then sessions)
  await rRepo.createQueryBuilder().delete().execute(); // Delete all reservations first
  console.log('✔ Existing reservations cleared');
  
  await sRepo.createQueryBuilder().delete().execute(); // Delete all sessions
  console.log('✔ Existing sessions cleared');

  const now = Date.now();
  const sessions = [
    sRepo.create({
      movieTitle: 'Matrix',
      startTime: new Date(now + 60 * 60 * 1000), // za 1h
      endTime: new Date(now + 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // 2h later
      totalSeats: 100,
      availableSeats: 100,
      price: 25.00,
      roomNumber: 1,
    }),
    sRepo.create({
      movieTitle: 'Inception',
      startTime: new Date(now + 2 * 60 * 60 * 1000), // za 2h
      endTime: new Date(now + 2 * 60 * 60 * 1000 + 2.5 * 60 * 60 * 1000), // 2.5h later
      totalSeats: 80,
      availableSeats: 80,
      price: 28.00,
      roomNumber: 2,
    }),
    sRepo.create({
      movieTitle: 'Interstellar',
      startTime: new Date(now + 3 * 60 * 60 * 1000), // za 3h
      endTime: new Date(now + 3 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000), // 3h later
      totalSeats: 120,
      availableSeats: 120,
      price: 30.00,
      roomNumber: 3,
    }),
    sRepo.create({
      movieTitle: 'Avatar: The Way of Water',
      startTime: new Date(now + 5 * 60 * 60 * 1000), // za 5h
      endTime: new Date(now + 5 * 60 * 60 * 1000 + 3.5 * 60 * 60 * 1000), // 3.5h later
      totalSeats: 150,
      availableSeats: 150,
      price: 32.00,
      roomNumber: 1,
    }),
    sRepo.create({
      movieTitle: 'Top Gun: Maverick',
      startTime: new Date(now + 7 * 60 * 60 * 1000), // za 7h
      endTime: new Date(now + 7 * 60 * 60 * 1000 + 2.2 * 60 * 60 * 1000), // 2.2h later
      totalSeats: 120,
      availableSeats: 120,
      price: 26.00,
      roomNumber: 2,
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

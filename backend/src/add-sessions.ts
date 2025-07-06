import { DataSource } from 'typeorm';
import { Session } from './entities/session.entity';

async function addMoreSessions() {
  const ds = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST ?? 'localhost',
    port: 3307,
    username: process.env.DB_USER ?? 'kino_user',
    password: process.env.DB_PASS ?? 'UserPass123',
    database: process.env.DB_NAME ?? 'kino',
    entities: [Session],
  });
  
  await ds.initialize();
  
  const sessionRepo = ds.getRepository(Session);
  
  // Add more sessions for the next few days
  const now = Date.now();
  const oneDayMs = 24 * 60 * 60 * 1000;
  
  const newSessions = [
    // Today - evening sessions
    sessionRepo.create({
      movieTitle: 'Avatar: The Way of Water',
      startTime: new Date(now + 5 * 60 * 60 * 1000), // 5 hours from now
      totalSeats: 150,
      availableSeats: 150,
    }),
    sessionRepo.create({
      movieTitle: 'Top Gun: Maverick',
      startTime: new Date(now + 7 * 60 * 60 * 1000), // 7 hours from now
      totalSeats: 120,
      availableSeats: 120,
    }),
    
    // Tomorrow sessions
    sessionRepo.create({
      movieTitle: 'The Batman',
      startTime: new Date(now + oneDayMs + 2 * 60 * 60 * 1000), // Tomorrow + 2 hours
      totalSeats: 100,
      availableSeats: 100,
    }),
    sessionRepo.create({
      movieTitle: 'Dune',
      startTime: new Date(now + oneDayMs + 4 * 60 * 60 * 1000), // Tomorrow + 4 hours
      totalSeats: 130,
      availableSeats: 130,
    }),
    sessionRepo.create({
      movieTitle: 'Spider-Man: No Way Home',
      startTime: new Date(now + oneDayMs + 6 * 60 * 60 * 1000), // Tomorrow + 6 hours
      totalSeats: 110,
      availableSeats: 110,
    }),
    
    // Day after tomorrow
    sessionRepo.create({
      movieTitle: 'Black Panther: Wakanda Forever',
      startTime: new Date(now + 2 * oneDayMs + 3 * 60 * 60 * 1000),
      totalSeats: 140,
      availableSeats: 140,
    }),
    sessionRepo.create({
      movieTitle: 'John Wick: Chapter 4',
      startTime: new Date(now + 2 * oneDayMs + 8 * 60 * 60 * 1000),
      totalSeats: 90,
      availableSeats: 90,
    }),
  ];
  
  await sessionRepo.save(newSessions);
  console.log(`✔ ${newSessions.length} additional sessions created`);
  
  // Show all sessions
  const allSessions = await sessionRepo.find({
    order: { startTime: 'ASC' }
  });
  
  console.log('\n📽️  All Sessions in Database:');
  allSessions.forEach((session, index) => {
    console.log(`${index + 1}. ${session.movieTitle}`);
    console.log(`   Start: ${session.startTime.toLocaleString()}`);
    console.log(`   Seats: ${session.availableSeats}/${session.totalSeats}`);
    console.log(`   ID: ${session.id}\n`);
  });
  
  await ds.destroy();
  console.log('🎉 Sessions added successfully!');
}

addMoreSessions().catch((err) => {
  console.error('❌ Failed to add sessions:', err);
  process.exit(1);
});

import { DataSource } from 'typeorm';
import { User } from './entities/user.entity';
import { Session } from './entities/session.entity';
import { Reservation } from './entities/reservation.entity';

// Movie data with titles, descriptions, durations (in hours), and prices
const MOVIES = [
  {
    title: 'Avatar: The Way of Water',
    description: 'Jake Sully and his family face new threats on Pandora as they explore the underwater regions of the alien world.',
    duration: 3.2, // 3 hours 12 minutes
    price: 35.00
  },
  {
    title: 'Top Gun: Maverick',
    description: 'Maverick confronts his past while training a new generation of elite pilots for a dangerous mission.',
    duration: 2.2, // 2 hours 12 minutes
    price: 30.00
  },
  {
    title: 'Spider-Man: No Way Home',
    description: 'Peter Parker faces villains from across the multiverse when a spell goes wrong.',
    duration: 2.5, // 2 hours 30 minutes
    price: 32.00
  },
  {
    title: 'The Batman',
    description: 'Batman uncovers corruption in Gotham City while pursuing the Riddler.',
    duration: 2.9, // 2 hours 54 minutes
    price: 33.00
  },
  {
    title: 'Doctor Strange in the Multiverse of Madness',
    description: 'Doctor Strange explores the multiverse with help from mystical allies.',
    duration: 2.1, // 2 hours 6 minutes
    price: 31.00
  },
  {
    title: 'Jurassic World Dominion',
    description: 'Humans and dinosaurs coexist in a world where dinosaurs roam freely.',
    duration: 2.4, // 2 hours 24 minutes
    price: 29.00
  },
  {
    title: 'Thor: Love and Thunder',
    description: 'Thor embarks on a journey of self-discovery with the Guardians of the Galaxy.',
    duration: 2.0, // 2 hours
    price: 28.00
  },
  {
    title: 'Minions: The Rise of Gru',
    description: 'Young Gru tries to join a supervillain supergroup while his Minions cause chaos.',
    duration: 1.5, // 1 hour 30 minutes
    price: 25.00
  },
  {
    title: 'Black Panther: Wakanda Forever',
    description: 'The people of Wakanda fight to protect their nation after the death of King T\'Challa.',
    duration: 2.7, // 2 hours 42 minutes
    price: 34.00
  },
  {
    title: 'Fantastic Beasts: The Secrets of Dumbledore',
    description: 'Newt Scamander and Dumbledore attempt to stop Grindelwald from gaining power.',
    duration: 2.3, // 2 hours 18 minutes
    price: 27.00
  },
  {
    title: 'Sonic the Hedgehog 2',
    description: 'Sonic teams up with Tails to stop Dr. Robotnik and his new partner Knuckles.',
    duration: 2.1, // 2 hours 6 minutes
    price: 26.00
  },
  {
    title: 'Morbius',
    description: 'A biochemist transforms into a vampire-like creature while trying to cure his rare blood disease.',
    duration: 1.7, // 1 hour 42 minutes
    price: 24.00
  },
  {
    title: 'The Northman',
    description: 'A Viking prince seeks revenge for his father\'s murder in this epic tale.',
    duration: 2.3, // 2 hours 18 minutes
    price: 30.00
  },
  {
    title: 'Everything Everywhere All at Once',
    description: 'A woman must connect with parallel universe versions of herself to prevent reality from unraveling.',
    duration: 2.4, // 2 hours 24 minutes
    price: 31.00
  },
  {
    title: 'Dune',
    description: 'Paul Atreides leads a rebellion to free his desert world from the emperor\'s rule.',
    duration: 2.6, // 2 hours 36 minutes
    price: 33.00
  }
];

// Cinema room configurations
const ROOMS = [
  { number: 1, totalSeats: 100 },
  { number: 2, totalSeats: 80 },
  { number: 3, totalSeats: 120 },
  { number: 4, totalSeats: 150 },
  { number: 5, totalSeats: 90 }
];

// Time slots for daily sessions (hour, minute)
const TIME_SLOTS = [
  [10, 0],   // 10:00
  [13, 30],  // 13:30
  [16, 45],  // 16:45
  [19, 15],  // 19:15
  [21, 30]   // 21:30
];

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function createSessionsForDate(date: Date): Partial<Session>[] {
  const sessions: Partial<Session>[] = [];
  const usedRooms = new Set<number>();
  
  // Ensure at least 1-2 sessions per day, maximum 4
  const sessionCount = Math.floor(Math.random() * 4) + 1; // 1-4 sessions
  
  for (let i = 0; i < sessionCount; i++) {
    const movie = getRandomElement(MOVIES);
    let room = getRandomElement(ROOMS);
    
    // Try to avoid room conflicts on the same day
    let attempts = 0;
    while (usedRooms.has(room.number) && attempts < 10) {
      room = getRandomElement(ROOMS);
      attempts++;
    }
    usedRooms.add(room.number);
    
    const timeSlot = getRandomElement(TIME_SLOTS);
    const startTime = new Date(date);
    startTime.setHours(timeSlot[0], timeSlot[1], 0, 0);
    
    const endTime = new Date(startTime);
    endTime.setTime(endTime.getTime() + movie.duration * 60 * 60 * 1000);
    
    sessions.push({
      movieTitle: movie.title,
      description: movie.description,
      startTime,
      endTime,
      totalSeats: room.totalSeats,
      availableSeats: room.totalSeats,
      price: movie.price,
      roomNumber: room.number,
    });
  }
  
  return sessions;
}

async function comprehensiveSeed() {
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
  console.log('🔗 Database connection established');

  const uRepo = ds.getRepository(User);
  const sRepo = ds.getRepository(Session);
  const rRepo = ds.getRepository(Reservation);

  // 1) Create admin user if it doesn't exist
  let admin = await uRepo.findOne({ where: { email: 'admin@kino.local' } });
  if (!admin) {
    admin = uRepo.create({
      username: 'admin',
      email: 'admin@kino.local',
      passwordHash: 'HASHED_PASSWORD_HERE', // <- replace with bcrypt.hashSync('your_password', salt)
      role: 'admin',
    });
    await uRepo.save(admin);
    console.log('✔ Admin user created');
  } else {
    console.log('✔ Admin user already exists');
  }

  // 2) Clear existing data in correct order
  await rRepo.createQueryBuilder().delete().execute();
  console.log('✔ Existing reservations cleared');
  
  await sRepo.createQueryBuilder().delete().execute();
  console.log('✔ Existing sessions cleared');

  // 3) Generate sessions for every day from 10.07.2025 to 24.03.2026
  const startDate = new Date('2025-07-10'); // 10.07.2025
  const endDate = new Date('2026-03-24');   // 24.03.2026
  
  console.log(`📅 Generating sessions from ${startDate.toDateString()} to ${endDate.toDateString()}`);
  
  const allSessions: Partial<Session>[] = [];
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    const dailySessions = createSessionsForDate(new Date(currentDate));
    allSessions.push(...dailySessions);
    
    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  console.log(`🎬 Generated ${allSessions.length} sessions across ${Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1} days`);
  
  // 4) Save all sessions in batches to avoid memory issues
  const batchSize = 100;
  for (let i = 0; i < allSessions.length; i += batchSize) {
    const batch = allSessions.slice(i, i + batchSize);
    const sessionEntities = batch.map(session => sRepo.create(session));
    await sRepo.save(sessionEntities);
    console.log(`✔ Saved batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(allSessions.length / batchSize)} (${sessionEntities.length} sessions)`);
  }
  
  console.log(`🎉 Successfully created ${allSessions.length} sessions!`);
  
  // 5) Show some statistics
  const movieCounts = new Map<string, number>();
  allSessions.forEach(session => {
    const count = movieCounts.get(session.movieTitle!) || 0;
    movieCounts.set(session.movieTitle!, count + 1);
  });
  
  console.log('\n📊 Movie distribution:');
  movieCounts.forEach((count, movie) => {
    console.log(`   ${movie}: ${count} sessions`);
  });

  await ds.destroy();
  console.log('\n🎉 Comprehensive seeding completed successfully!');
}

comprehensiveSeed().catch((err) => {
  console.error('❌ Comprehensive seeding failed:', err);
  process.exit(1);
});

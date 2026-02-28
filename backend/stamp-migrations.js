const mysql2 = require('mysql2/promise');

async function main() {
  const conn = await mysql2.createConnection({
    host: '192.168.100.162', port: 3306,
    user: 'kino_user', password: 'UserPass123', database: 'kino'
  });

  // Ensure migrations table exists (TypeORM schema)
  await conn.query(`
    CREATE TABLE IF NOT EXISTS \`migrations\` (
      \`id\` int NOT NULL AUTO_INCREMENT,
      \`timestamp\` bigint NOT NULL,
      \`name\` varchar(255) NOT NULL,
      PRIMARY KEY (\`id\`)
    ) ENGINE=InnoDB
  `);

  const toStamp = [
    [1750009543676, 'InitSchema1750009543676'],
    [1750515434206, 'AddUsernameToUsers1750515434206'],
    [1750520000000, 'AddSessionFields1750520000000'],
    [1750525000000, 'AddDescriptionToSessions1750525000000'],
    [1750530000000, 'AddSeatNumbersToReservations1750530000000'],
    [1752781711527, 'AddVersionToReservations1752781711527'],
  ];

  for (const [ts, name] of toStamp) {
    const [result] = await conn.query(
      'INSERT IGNORE INTO `migrations` (`timestamp`, `name`) VALUES (?, ?)',
      [ts, name]
    );
    console.log(`Stamped: ${name}`);
  }

  const [rows] = await conn.query('SELECT * FROM `migrations` ORDER BY `id`');
  console.log('\nMigrations table now contains:');
  rows.forEach(r => console.log(` - [${r.timestamp}] ${r.name}`));

  await conn.end();
  console.log('\nDone.');
}

main().catch(e => { console.error('Error:', e.message); process.exit(1); });

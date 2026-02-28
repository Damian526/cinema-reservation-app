const mysql2 = require('mysql2/promise');

async function main() {
  const conn = await mysql2.createConnection({
    host: '192.168.100.162', port: 3306,
    user: 'kino_user', password: 'UserPass123', database: 'kino',
    multipleStatements: false,
  });

  const run = async (sql, label) => {
    try {
      await conn.query(sql);
      console.log('OK:', label);
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME' || e.code === 'ER_TABLE_EXISTS_ERROR' || e.code === 'ER_DUP_KEYNAME') {
        console.log('SKIP (already exists):', label);
      } else {
        console.error('FAIL:', label, '→', e.message);
        throw e;
      }
    }
  };

  // ── sessions: missing columns ──────────────────────────────────────────
  await run(`ALTER TABLE \`sessions\` ADD \`endTime\` datetime NOT NULL DEFAULT '2000-01-01 00:00:00'`, 'sessions.endTime');
  await run(`ALTER TABLE \`sessions\` ADD \`price\` decimal(10,2) NOT NULL DEFAULT 0`, 'sessions.price');
  await run(`ALTER TABLE \`sessions\` ADD \`roomNumber\` smallint UNSIGNED NOT NULL DEFAULT 1`, 'sessions.roomNumber');
  await run(`ALTER TABLE \`sessions\` ADD \`description\` text NULL`, 'sessions.description');

  // ── reservations: create table ─────────────────────────────────────────
  await run(`
    CREATE TABLE \`reservations\` (
      \`id\`          int UNSIGNED    NOT NULL AUTO_INCREMENT,
      \`userId\`      int UNSIGNED    NOT NULL,
      \`sessionId\`   int UNSIGNED    NOT NULL,
      \`seatsBooked\` smallint UNSIGNED NOT NULL,
      \`seatNumbers\` json            NULL,
      \`reservedAt\`  timestamp       NOT NULL DEFAULT CURRENT_TIMESTAMP,
      \`version\`     int UNSIGNED    NOT NULL DEFAULT 0,
      PRIMARY KEY (\`id\`),
      CONSTRAINT \`FK_reservations_user\`    FOREIGN KEY (\`userId\`)    REFERENCES \`users\`(\`id\`)    ON DELETE CASCADE,
      CONSTRAINT \`FK_reservations_session\` FOREIGN KEY (\`sessionId\`) REFERENCES \`sessions\`(\`id\`) ON DELETE CASCADE
    ) ENGINE=InnoDB
  `, 'CREATE reservations');

  // ── stamp the AddMoviesTable migration (already applied previously) ────
  // (just re-check it's there)
  const [rows] = await conn.query("SELECT name FROM `migrations` ORDER BY timestamp");
  console.log('\nApplied migrations:');
  rows.forEach(r => console.log(' ✓', r.name));

  // ── final schema check ─────────────────────────────────────────────────
  for (const table of ['users', 'sessions', 'reservations', 'movies']) {
    const [cols] = await conn.query(`SHOW COLUMNS FROM \`${table}\``);
    console.log(`\n${table}: ${cols.map(c => c.Field).join(', ')}`);
  }

  await conn.end();
  console.log('\nSchema is ready.');
}

main().catch(e => { console.error('\nFatal:', e.message); process.exit(1); });

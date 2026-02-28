const mysql2 = require('mysql2/promise');

async function main() {
  const conn = await mysql2.createConnection({
    host: '192.168.100.162', port: 3306,
    user: 'kino_user', password: 'UserPass123', database: 'kino'
  });

  for (const table of ['sessions', 'reservations', 'users']) {
    const [cols] = await conn.query(`SHOW COLUMNS FROM \`${table}\``);
    console.log(`\n${table} columns:`);
    cols.forEach(c => console.log(`  ${c.Field} [${c.Type}] null=${c.Null} default=${c.Default}`));
  }

  await conn.end();
}

main().catch(e => { console.error('Error:', e.message); process.exit(1); });

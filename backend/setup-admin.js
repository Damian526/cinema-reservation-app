const mysql2 = require('mysql2/promise');
const bcrypt = require('bcrypt');

async function main() {
  const conn = await mysql2.createConnection({
    host: '192.168.100.162', port: 3306,
    user: 'kino_user', password: 'UserPass123', database: 'kino'
  });

  // Check users table columns
  const [cols] = await conn.query("SHOW COLUMNS FROM `users`");
  console.log('users table columns:');
  cols.forEach(c => console.log(` - ${c.Field} [${c.Type}]`));

  // Add username column if missing
  const hasUsername = cols.some(c => c.Field === 'username');
  if (!hasUsername) {
    await conn.query("ALTER TABLE `users` ADD COLUMN `username` varchar(50) NOT NULL DEFAULT '' AFTER `id`");
    await conn.query("UPDATE `users` SET `username` = CONCAT('user_', id) WHERE `username` = ''");
    await conn.query("ALTER TABLE `users` ADD UNIQUE INDEX `UQ_users_username` (`username`)");
    console.log('Added username column to users table');
  }

  // Show existing users
  const [users] = await conn.query("SELECT id, username, email, role FROM `users` LIMIT 10");
  console.log('\nExisting users:', users);

  // Create admin user if not exists
  const adminEmail = 'admin@cinema.local';
  const [existing] = await conn.query("SELECT id FROM `users` WHERE email = ?", [adminEmail]);
  
  if (existing.length === 0) {
    const hash = await bcrypt.hash('Admin123!', 10);
    await conn.query(
      "INSERT INTO `users` (`username`, `email`, `passwordHash`, `role`) VALUES (?, ?, ?, ?)",
      ['admin', adminEmail, hash, 'admin']
    );
    console.log('\nAdmin user created:');
    console.log('  Email:', adminEmail);
    console.log('  Password: Admin123!');
  } else {
    // Update existing to admin
    await conn.query("UPDATE `users` SET `role` = 'admin' WHERE `email` = ?", [adminEmail]);
    console.log('\nAdmin user already exists, ensured role=admin');
  }

  await conn.end();
}

main().catch(e => { console.error('Error:', e.message); process.exit(1); });

const { DataSource } = require('typeorm');

const dataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: 3307,
  username: process.env.DB_USER || 'kino_user',
  password: process.env.DB_PASS || 'UserPass123',
  database: process.env.DB_NAME || 'kino',
  entities: ['src/entities/*.entity.ts'],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
});

module.exports = dataSource;

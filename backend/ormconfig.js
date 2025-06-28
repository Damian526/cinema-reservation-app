const { DataSource } = require('typeorm');

const dataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3307,
  username: process.env.DB_USERNAME || process.env.DB_USER || 'kino_user',
  password: process.env.DB_PASSWORD || process.env.DB_PASS || 'UserPass123',
  database: process.env.DB_DATABASE || process.env.DB_NAME || 'kino',
  entities: ['src/entities/*.entity.ts'],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
});

module.exports = dataSource;

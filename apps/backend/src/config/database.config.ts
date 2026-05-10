// backend/src/config/database.config.ts

import { registerAs } from '@nestjs/config';

// registerAs یک namespace برای config ایجاد می‌کند
// این باعث می‌شود config های مختلف با هم قاطی نشوند
export default registerAs('database', () => ({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  name: process.env.DB_NAME,
  ssl: process.env.DB_SSL === 'true',
  sslRejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false',
}));

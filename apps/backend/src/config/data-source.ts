import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { join } from 'path';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'shopdb',
  ssl:
    process.env.DB_SSL === 'true'
      ? {
          rejectUnauthorized:
            process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false',
        }
      : false,

  // Entity loading - مسیر مطلق
  entities: [
    join(__dirname, '../domains/auth/**/*.entity{.ts,.js}'),
    join(__dirname, '../domains/users/**/*.entity{.ts,.js}'),
    join(__dirname, '../domains/catalog/**/*.entity{.ts,.js}'),
    join(__dirname, '../domains/cart/**/*.entity{.ts,.js}'),
    join(__dirname, '../domains/orders/**/*.entity{.ts,.js}'),
    join(__dirname, '../domains/payments/**/*.entity{.ts,.js}'),
    join(__dirname, '../domains/campaign/**/*.entity{.ts,.js}'),
    join(__dirname, '../domains/blogs/**/*.entity{.ts,.js}'),
    join(__dirname, '../domains/banners/**/*.entity{.ts,.js}'),
    join(__dirname, '../domains/shipping/**/*.entity{.ts,.js}'),
    join(__dirname, '../domains/media/**/*.entity{.ts,.js}'),
  ],

  migrations: [join(__dirname, '../database/migrations/*{.ts,.js}')],

  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
});

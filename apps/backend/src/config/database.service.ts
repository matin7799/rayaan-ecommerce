// backend/src/config/database.service.ts

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';

@Injectable()
export class DatabaseService implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    const useSsl = this.configService.get<boolean>('database.ssl');
    const sslRejectUnauthorized = this.configService.get<boolean>(
      'database.sslRejectUnauthorized',
    );

    return {
      type: 'postgres',
      host: this.configService.get<string>('database.host'),
      port: this.configService.get<number>('database.port'),
      username: this.configService.get<string>('database.username'),
      password: this.configService.get<string>('database.password'),
      database: this.configService.get<string>('database.name'),
      ssl: useSsl
        ? {
            rejectUnauthorized: sslRejectUnauthorized,
          }
        : false,

      // TypeORM به صورت خودکار entity ها را پیدا می‌کند
      autoLoadEntities: true,

      // Keep false to avoid destructive schema drift; use migrations instead.
      synchronize: false,
      logging: process.env.NODE_ENV === 'development',

      // Connection pool configuration
      extra: {
        max: 20, // Maximum number of connections in pool
        min: 5, // Minimum number of connections in pool
        idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
        connectionTimeoutMillis: 5000, // Connection timeout 5 seconds
        statement_timeout: 10000, // Query timeout 10 seconds
      },

      // Connection retry configuration
      retryAttempts: 3,
      retryDelay: 3000,
    };
  }
}

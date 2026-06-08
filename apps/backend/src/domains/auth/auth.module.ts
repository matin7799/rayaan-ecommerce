import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import Redis from 'ioredis';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User } from '../users/entities/user.entity';
import { UsersRepository } from '../users/users.repository';
import { JwtStrategy } from './strategies/jwt.strategy';
import { SmsModule } from '../../providers/sms/sms.module';
import { AuthBlacklistService } from './auth-blacklist.service';

@Module({
  imports: [
    ConfigModule,
    SmsModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    TypeOrmModule.forFeature([User]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('jwt.secret', 'fallback-secret'),
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    UsersRepository,
    AuthBlacklistService,
    {
      provide: 'REDIS_CLIENT',
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return new Redis({
          host: config.get<string>('redis.host', 'localhost'),
          port: config.get<number>('redis.port', 6379),
          password: config.get<string>('redis.password', ''),
          db: config.get<number>('redis.db', 0),
        });
      },
    },
  ],
  exports: [AuthService, AuthBlacklistService],
})
export class AuthModule {}

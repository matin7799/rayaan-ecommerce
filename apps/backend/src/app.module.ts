import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import { ThrottlerModule } from '@nestjs/throttler';
import { DatabaseService } from './config/database.service';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { SanitizeMiddleware } from './common/middleware/sanitize.middleware';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import redisConfig from './config/redis.config';
import { validate } from './config/env.validation';

// Domain modules
import { AuthModule } from './domains/auth/auth.module';
import { UsersModule } from './domains/users/users.module';
import { CatalogModule } from './domains/catalog/catalog.module';
import { MediaModule } from './domains/media/media.module';
import { BannersModule } from './domains/banners/banners.module';
import { BlogsModule } from './domains/blogs/blogs.module';
import { CampaignModule } from './domains/campaign/campaign.module';
import { CartModule } from './domains/cart/cart.module';
import { OrdersModule } from './domains/orders/orders.module';
import { PaymentsModule } from './domains/payments/payments.module';
import { ShippingModule } from './domains/shipping/shipping.module';
import { RedisModule } from './shared/redis/redis.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate,
      load: [databaseConfig, redisConfig, jwtConfig],
    }),

    // Rate limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 60 seconds
        limit: 100, // 100 requests per minute
      },
    ]),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useClass: DatabaseService,
    }),

    // Redis برای OTP و cache
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        store: await redisStore({
          socket: {
            host: configService.get<string>('REDIS_HOST', 'localhost'),
            port: configService.get<number>('REDIS_PORT', 6379),
          },
        }),
      }),
    }),

    // Domain modules
    AuthModule,
    UsersModule,
    CatalogModule,
    MediaModule,
    BannersModule,
    BlogsModule,
    CartModule,
    OrdersModule,
    PaymentsModule,
    ShippingModule,
    CampaignModule,
    RedisModule,
    HealthModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(SanitizeMiddleware, LoggerMiddleware).forRoutes('*');
  }
}

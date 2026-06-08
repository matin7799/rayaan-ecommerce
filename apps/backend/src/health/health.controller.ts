import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Inject } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_CLIENT } from '../shared/redis/redis.constants';

@Controller('health')
export class HealthController {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @Inject(REDIS_CLIENT)
    private readonly redis: Redis,
  ) {}

  @Get()
  async check() {
    const dbStatus = await this.checkDatabase();
    const redisStatus = await this.checkRedis();

    const isHealthy = dbStatus.healthy && redisStatus.healthy;

    return {
      status: isHealthy ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services: {
        database: dbStatus,
        redis: redisStatus,
      },
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
    };
  }

  @Get('ready')
  async readiness() {
    const dbStatus = await this.checkDatabase();
    const redisStatus = await this.checkRedis();

    if (!dbStatus.healthy || !redisStatus.healthy) {
      throw new ServiceUnavailableException('Service not ready');
    }

    return { status: 'ready' };
  }

  @Get('live')
  liveness() {
    return { status: 'alive' };
  }

  private async checkDatabase(): Promise<{
    healthy: boolean;
    latency?: number;
    error?: string;
  }> {
    try {
      const start = Date.now();
      await this.dataSource.query('SELECT 1');
      const latency = Date.now() - start;
      return { healthy: true, latency };
    } catch (error) {
      const err = error as Error;
      return { healthy: false, error: err.message };
    }
  }

  private async checkRedis(): Promise<{
    healthy: boolean;
    latency?: number;
    error?: string;
  }> {
    try {
      const start = Date.now();
      await this.redis.ping();
      const latency = Date.now() - start;
      return { healthy: true, latency };
    } catch (error) {
      const err = error as Error;
      return { healthy: false, error: err.message };
    }
  }
}

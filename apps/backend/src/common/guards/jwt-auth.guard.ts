// backend/src/common/guards/jwt-auth.guard.ts

import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import Redis from 'ioredis';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (token) {
      const isBlacklisted = await this.redis.get(`token:blacklist:${token}`);
      if (isBlacklisted) {
        throw new UnauthorizedException(
          'توجیه امنیتی: توکن نامعتبر است یا با خروج باطل شده است.',
        );
      }
    }

    return super.canActivate(context) as boolean;
  }

  private extractTokenFromHeader(request: any): string | null {
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }
    return null;
  }
}

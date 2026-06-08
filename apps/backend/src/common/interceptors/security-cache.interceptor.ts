import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import type { Response } from 'express';

@Injectable()
export class SecurityCacheInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const http = context.switchToHttp();
    const request = http.getRequest();
    const response = http.getResponse<Response>();

    const hasAuth =
      request.headers.authorization ||
      request.cookies?.refresh_token ||
      request.user;
    const isMutation = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(
      request.method,
    );

    return next.handle().pipe(
      tap(() => {
        if (hasAuth || isMutation) {
          response.setHeader(
            'Cache-Control',
            'no-store, no-cache, must-revalidate, proxy-revalidate',
          );
          response.setHeader('Pragma', 'no-cache');
          response.setHeader('Expires', '0');
        }
      }),
    );
  }
}

// apps/backend/src/common/guards/optional-jwt-auth.guard.ts

import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  // Override canActivate to make authentication optional
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // Call parent canActivate but catch any errors
    const result = super.canActivate(context);

    if (result instanceof Promise) {
      return result.catch(() => true); // If auth fails, still allow (guest user)
    }

    return result;
  }

  // Override handleRequest to not throw error when no user
  handleRequest(err: any, user: any, _info: any) {
    // Return user if authenticated, null if not
    // This allows both authenticated and guest users
    // The controller can check if user exists to determine auth status
    return user;
  }
}

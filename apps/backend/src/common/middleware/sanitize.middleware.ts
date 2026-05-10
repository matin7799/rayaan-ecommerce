import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class SanitizeMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Keep normalization minimal to avoid corrupting user input.
    if (req.body) {
      req.body = this.sanitizeObject(req.body);
    }

    // Sanitize query - create new object to avoid read-only issues
    if (req.query) {
      const sanitized = this.sanitizeObject(req.query);
      Object.keys(req.query).forEach((key) => delete req.query[key]);
      Object.assign(req.query, sanitized);
    }

    // Sanitize params - create new object to avoid read-only issues
    if (req.params) {
      const sanitized = this.sanitizeObject(req.params);
      Object.keys(req.params).forEach((key) => delete req.params[key]);
      Object.assign(req.params, sanitized);
    }

    next();
  }

  private sanitizeObject(obj: unknown): unknown {
    if (typeof obj === 'string') {
      return this.sanitizeString(obj);
    }
    if (Array.isArray(obj)) {
      return obj.map((item) => this.sanitizeObject(item));
    }
    if (obj && typeof obj === 'object') {
      const source = obj as Record<string, unknown>;
      const sanitized: Record<string, unknown> = {};
      for (const key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          sanitized[key] = this.sanitizeObject(source[key]);
        }
      }
      return sanitized;
    }
    return obj;
  }

  private sanitizeString(str: string): string {
    return str.trim();
  }
}

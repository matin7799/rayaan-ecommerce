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
    const trimmed = str.trim();
    // Check if it contains HTML-like elements
    if (/<[a-z][\s\S]*>/i.test(trimmed)) {
      // Strips dangerous tags: <script>, <iframe>, <object>, <embed>, <applet>
      // and inline events like onclick, onload, onerror, etc.
      return trimmed
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
        .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
        .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
        .replace(/<applet\b[^<]*(?:(?!<\/applet>)<[^<]*)*<\/applet>/gi, '')
        .replace(/\s+on\w+\s*=\s*(["'][^"']*["']|[^\s>]+)/gi, '')
        .replace(/javascript\s*:/gi, 'no-javascript:');
    }
    // Escape standard text characters to prevent XSS
    return trimmed.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
}

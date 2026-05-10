import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface ErrorResponse {
  success: false;
  data: null;
  error: {
    code: string;
    message: string;
    details?: any[];
  };
  meta: {
    requestId: string;
    timestamp: string;
    path: string;
  };
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('GlobalExceptionFilter');
  private readonly isDevelopment = process.env.NODE_ENV === 'development';

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorCode = 'INTERNAL_ERROR';
    let message = 'خطای داخلی سرور';
    let details: any[] = [];

    // Handle HttpException
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const responseObj = exceptionResponse as any;

        // Handle validation errors
        if (Array.isArray(responseObj.message)) {
          errorCode = 'VALIDATION_ERROR';
          message = 'اطلاعات وارد شده نامعتبر است';
          details = responseObj.message.map((msg: string) => ({
            message: msg,
          }));
        } else {
          message = responseObj.message || message;
          errorCode =
            responseObj.code ||
            responseObj.error ||
            this.getErrorCodeFromStatus(status);
        }
      } else if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
        errorCode = this.getErrorCodeFromStatus(status);
      }
    }

    // Generate request ID
    const requestId =
      (request.headers['x-request-id'] as string) || this.generateRequestId();

    // Build error response
    const errorResponse: ErrorResponse = {
      success: false,
      data: null,
      error: {
        code: errorCode,
        message,
        ...(details.length > 0 && { details }),
      },
      meta: {
        requestId,
        timestamp: new Date().toISOString(),
        path: request.url,
      },
    };

    // Log error
    this.logError(exception, request, status, requestId);

    // Send response
    response.status(status).json(errorResponse);
  }

  private getErrorCodeFromStatus(status: number): string {
    const statusMap: Record<number, string> = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
      422: 'VALIDATION_ERROR',
      429: 'RATE_LIMIT_EXCEEDED',
      500: 'INTERNAL_ERROR',
      503: 'SERVICE_UNAVAILABLE',
    };

    return statusMap[status] || 'UNKNOWN_ERROR';
  }

  private logError(
    exception: unknown,
    request: Request,
    status: number,
    requestId: string,
  ) {
    const message =
      exception instanceof Error ? exception.message : 'Unknown error';
    const stack = exception instanceof Error ? exception.stack : '';

    const logMessage = `[${request.method}] ${request.url} → ${status}: ${message}`;

    if (status >= 500) {
      this.logger.error(logMessage);
      if (this.isDevelopment && stack) {
        this.logger.error(stack);
      }
    } else if (status >= 400) {
      this.logger.warn(logMessage);
    }

    // Log full error in development
    if (this.isDevelopment) {
      this.logger.debug({
        requestId,
        method: request.method,
        url: request.url,
        status,
        error: exception,
        body: request.body,
        query: request.query,
        params: request.params,
      });
    }
  }

  private generateRequestId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

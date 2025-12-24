import {
    CallHandler,
    ExecutionContext,
    Injectable,
    Logger,
    NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, url, body, query, params } = request;
    const requestId = request['requestId'] || 'unknown';
    const userAgent = request.get('user-agent') || '';
    const ip = request.ip || request.connection.remoteAddress;

    const now = Date.now();

    this.logger.log(
      `[${requestId}] ${method} ${url} - ${ip} - ${userAgent}`,
    );

    // Sanitize sensitive fields before logging
    const sanitizeData = (data: any): any => {
      if (!data || typeof data !== 'object') return data;
      const sanitized = { ...data };
      const sensitiveFields = ['password', 'refreshToken', 'accessToken', 'token'];
      sensitiveFields.forEach(field => {
        if (sanitized[field]) {
          sanitized[field] = '[REDACTED]';
        }
      });
      return sanitized;
    };

    if (Object.keys(body || {}).length > 0) {
      this.logger.debug(`[${requestId}] Body: ${JSON.stringify(sanitizeData(body))}`);
    }
    if (Object.keys(query || {}).length > 0) {
      this.logger.debug(`[${requestId}] Query: ${JSON.stringify(sanitizeData(query))}`);
    }
    if (Object.keys(params || {}).length > 0) {
      this.logger.debug(`[${requestId}] Params: ${JSON.stringify(sanitizeData(params))}`);
    }

    return next.handle().pipe(
      tap({
        next: (data) => {
          const responseTime = Date.now() - now;
          this.logger.log(
            `[${requestId}] ${method} ${url} - ${responseTime}ms - Success`,
          );
        },
        error: (error) => {
          const responseTime = Date.now() - now;
          this.logger.error(
            `[${requestId}] ${method} ${url} - ${responseTime}ms - Error: ${error.message}`,
          );
        },
      }),
    );
  }
}






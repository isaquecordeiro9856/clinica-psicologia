import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { LoggerService, createRequestId } from '../logger/logger.service';

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  constructor(private readonly logger: LoggerService) {}

  use(req: Request & { requestId?: string }, res: Response, next: NextFunction) {
    const requestId = (req.headers['x-request-id'] as string) || createRequestId();
    req.requestId = requestId;
    res.setHeader('X-Request-ID', requestId);

    const start = Date.now();
    const { method, originalUrl, ip } = req;
    const userAgent = req.get('user-agent') || 'unknown';

    const log = this.logger.withRequestId(requestId);

    res.on('finish', () => {
      const duration = Date.now() - start;
      const status = res.statusCode;
      const level = status >= 500 ? 'error' : status >= 400 ? 'warn' : 'info';

      log[level]({
        method,
        url: originalUrl,
        status,
        duration: `${duration}ms`,
        ip,
        userAgent,
      }, `${method} ${originalUrl} ${status} ${duration}ms`);
    });

    next();
  }
}
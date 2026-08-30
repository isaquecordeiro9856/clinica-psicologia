import { Injectable, LoggerService as NestLoggerService, Logger } from '@nestjs/common';
import pino from 'pino';
import { randomUUID } from 'crypto';

@Injectable()
export class LoggerService implements NestLoggerService {
  private readonly logger: pino.Logger;
  private readonly contextLogger = new Logger(LoggerService.name);

  constructor() {
    const isProduction = process.env.NODE_ENV === 'production';
    const isTest = process.env.NODE_ENV === 'test' || process.env.VITEST === 'true';
    
    this.logger = pino({
      level: isProduction ? 'info' : 'debug',
      transport: (isProduction || isTest) ? undefined : {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      },
      formatters: {
        level: (label) => ({ level: label.toUpperCase() }),
      },
      timestamp: pino.stdTimeFunctions.isoTime,
      base: {
        service: 'clinica-psi-api',
        environment: process.env.NODE_ENV || 'development',
      },
    });
  }

  log(message: string, context?: string, meta?: Record<string, unknown>) {
    this.logger.info({ context, ...meta }, message);
    this.contextLogger.log(message, context);
  }

  error(message: string, trace?: string, context?: string, meta?: Record<string, unknown>) {
    this.logger.error({ context, trace, ...meta }, message);
    this.contextLogger.error(message, trace, context);
  }

  warn(message: string, context?: string, meta?: Record<string, unknown>) {
    this.logger.warn({ context, ...meta }, message);
    this.contextLogger.warn(message, context);
  }

  debug(message: string, context?: string, meta?: Record<string, unknown>) {
    this.logger.debug({ context, ...meta }, message);
    this.contextLogger.debug(message, context);
  }

  verbose(message: string, context?: string, meta?: Record<string, unknown>) {
    this.logger.trace({ context, ...meta }, message);
  }

  child(bindings: Record<string, unknown>) {
    return this.logger.child(bindings);
  }

  withRequestId(requestId: string) {
    return this.logger.child({ requestId });
  }

  withUser(userId: string, role: string) {
    return this.logger.child({ userId, role });
  }
}

export function createRequestId(): string {
  return randomUUID();
}
import { Controller, Get, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { RedisService } from '../../infra/redis/redis.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  private readonly logger = new Logger(HealthController.name);
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Health check com PostgreSQL e Redis' })
  async check() {
    const checks: Record<string, string> = {};

    // PostgreSQL
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      checks.postgres = 'ok';
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Postgres health check failed: ${message}`, error instanceof Error ? error.stack : undefined);
      checks.postgres = 'error';
    }

    // Redis
    try {
      await this.redis.cacheGet('health-check');
      checks.redis = 'ok';
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Redis health check failed: ${message}`, error instanceof Error ? error.stack : undefined);
      checks.redis = 'error';
    }

    const allHealthy = Object.values(checks).every((v) => v === 'ok');

    return {
      status: allHealthy ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      checks,
    };
  }
}

import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { validateConfig } from './config/configuration';
import { PrismaModule } from './infra/prisma/prisma.module';
import { RedisModule } from './infra/redis/redis.module';
import { QueueModule } from './infra/queue/queue.module';
import { LoggerModule } from './common/logger/logger.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { PatientsModule } from './modules/patients/patients.module';
import { SchedulingModule } from './modules/scheduling/scheduling.module';
import { ClinicalRecordsModule } from './modules/clinical-records/clinical-records.module';
import { BillingModule } from './modules/billing/billing.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { ReportsModule } from './modules/reports/reports.module';
import { AuditModule } from './modules/audit/audit.module';
import { HealthModule } from './modules/health/health.module';
import { TelehealthModule } from './modules/telehealth/telehealth.module';
import { RequestLoggerMiddleware } from './common/middleware/request-logger.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateConfig,
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60_000,
          limit: 60,
        },
      ],
    }),
    LoggerModule,
    PrismaModule,
    RedisModule,
    QueueModule,
    HealthModule,
    AuthModule,
    UsersModule,
    PatientsModule,
    SchedulingModule,
    ClinicalRecordsModule,
    BillingModule,
    NotificationsModule,
    DocumentsModule,
    ReportsModule,
    AuditModule,
    TelehealthModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // RequestLoggerMiddleware disabled for now - DI issue in test environment
    // consumer.apply(RequestLoggerMiddleware).forRoutes('*');
  }
}

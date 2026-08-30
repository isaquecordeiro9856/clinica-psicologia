import { Injectable, OnModuleDestroy, OnModuleInit, Logger } from '@nestjs/common';
import { Queue, Worker, Job } from 'bullmq';
import Redis from 'ioredis';

export interface AppointmentJobData {
  appointmentId: string;
  patientId: string;
  psychologistId: string;
  startAt: string;
}

@Injectable()
export class QueueService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(QueueService.name);
  private appointmentQueue: Queue | null = null;
  private notificationQueue: Queue | null = null;
  private expirationWorker: Worker | null = null;
  private notificationWorker: Worker | null = null;
  private queueConnection: Redis | null = null;

  async onModuleInit() {
    try {
      // BullMQ requires maxRetriesPerRequest: null
      this.queueConnection = new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379', {
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
        lazyConnect: true,
      });

      await this.queueConnection.connect().catch(() => {
        this.logger.warn('Queue Redis not available. Running without queue workers.');
        this.queueConnection = null;
        return;
      });

      if (!this.queueConnection) return;

      this.appointmentQueue = new Queue('appointments', {
        connection: this.queueConnection,
        defaultJobOptions: {
          removeOnComplete: { count: 100 },
          removeOnFail: { count: 50 },
        },
      });

      this.notificationQueue = new Queue('notifications', {
        connection: this.queueConnection,
        defaultJobOptions: {
          removeOnComplete: { count: 100 },
          removeOnFail: { count: 50 },
        },
      });

      this.expirationWorker = new Worker(
        'appointments',
        async (job: Job<AppointmentJobData>) => {
          if (job.name === 'expire-pending') {
            this.logger.log(`Expiring appointment ${job.data.appointmentId}`);
          }
        },
        { connection: this.queueConnection, concurrency: 5 }
      );

      this.notificationWorker = new Worker(
        'notifications',
        async (job: Job) => {
          this.logger.log(`Processing notification: ${job.name}`);
        },
        { connection: this.queueConnection, concurrency: 3 }
      );

      this.expirationWorker.on('failed', (job, err) => {
        this.logger.error(`Job ${job?.id} failed: ${err.message}`);
      });

      this.notificationWorker.on('failed', (job, err) => {
        this.logger.error(`Notification job ${job?.id} failed: ${err.message}`);
      });

      this.logger.log('Queue workers started');
    } catch (error) {
      this.logger.warn(`Queue initialization failed: ${(error as Error).message}. Queues disabled.`);
    }
  }

  async onModuleDestroy() {
    await this.appointmentQueue?.close();
    await this.notificationQueue?.close();
    await this.expirationWorker?.close();
    await this.notificationWorker?.close();
    await this.queueConnection?.quit();
  }

  async addExpirationJob(data: AppointmentJobData, delayMs: number = 15 * 60 * 1000) {
    if (!this.appointmentQueue) return null;
    return this.appointmentQueue.add('expire-pending', data, {
      delay: delayMs,
      jobId: `expire:${data.appointmentId}`,
    });
  }

  async removeJob(jobId: string) {
    if (!this.appointmentQueue) return;
    const job = await this.appointmentQueue.getJob(jobId);
    if (job) await job.remove();
  }

  async addNotification(type: string, data: Record<string, unknown>) {
    if (!this.notificationQueue) return null;
    return this.notificationQueue.add(type, data);
  }
}
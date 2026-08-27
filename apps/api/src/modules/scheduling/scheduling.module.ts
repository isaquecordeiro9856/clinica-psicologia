import { Module } from '@nestjs/common';
import { SchedulingController } from './scheduling.controller';
import { SchedulingService } from './scheduling.service';
import { AvailabilityController } from './availability.controller';

@Module({ controllers: [SchedulingController, AvailabilityController], providers: [SchedulingService] })
export class SchedulingModule {}

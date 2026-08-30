import { Module } from '@nestjs/common';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';
import { PixStaticProvider } from '../../infra/providers/payment/pix-static.provider';

@Module({
  controllers: [BillingController],
  providers: [BillingService, PixStaticProvider],
})
export class BillingModule {}

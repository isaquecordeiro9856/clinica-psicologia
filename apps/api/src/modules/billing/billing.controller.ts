import { Controller, Get, Post, Patch, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { BillingService } from './billing.service';

@ApiTags('billings')
@Controller('billings')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class BillingController {
  constructor(private billing: BillingService) {}

  @Get()
  list(@Query() q: Record<string, string>) {
    return this.billing.list(q).then((data) => ({ data }));
  }

  @Post(':id/pix')
  createPix(@Param('id') id: string) {
    return this.billing.createPix(id).then((data) => ({ data }));
  }

  @Patch(':id/mark-paid')
  markPaid(@Param('id') id: string) {
    return this.billing.markPaid(id).then((data) => ({ data }));
  }

  @Post('webhooks/pix')
  // Público com HMAC — MVP sem verificação
  webhook(@Body() body: { txid: string; status: string; eventId: string }) {
    return this.billing.webhookPix(body);
  }
}

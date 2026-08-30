import { Controller, Get, Post, Patch, Delete, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { BillingService } from './billing.service';
import { ListBillingsDto } from './dto/list-billings.dto';
import { CreateBillingDto } from './dto/create-billing.dto';
import { UpdateBillingDto } from './dto/update-billing.dto';
import { WebhookPixDto } from './dto/webhook-pix.dto';

@ApiTags('billings')
@Controller('billings')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('access-token')
export class BillingController {
  constructor(private billing: BillingService) {}

  @Get()
  @ApiOperation({ summary: 'Listar cobranças' })
  list(@CurrentUser() user: { sub: string; role: string }, @Query() q: ListBillingsDto) {
    return this.billing.list(q, user);
  }

  @Post()
  @Roles('psychologist', 'secretary')
  @ApiOperation({ summary: 'Criar cobrança manual' })
  create(@CurrentUser() user: { sub: string; role: string }, @Body() dto: CreateBillingDto) {
    return this.billing.create(user, dto).then((data) => ({ data }));
  }

  @Patch(':id')
  @Roles('psychologist', 'secretary')
  @ApiOperation({ summary: 'Atualizar cobrança' })
  update(@Param('id') id: string, @CurrentUser() user: { sub: string; role: string }, @Body() dto: UpdateBillingDto) {
    return this.billing.update(id, user, dto).then((data) => ({ data }));
  }

  @Delete(':id')
  @Roles('psychologist', 'secretary')
  @ApiOperation({ summary: 'Excluir cobrança' })
  remove(@Param('id') id: string, @CurrentUser() user: { sub: string; role: string }) {
    return this.billing.remove(id, user).then((data) => ({ data }));
  }

  @Post(':id/pix')
  @Roles('psychologist', 'secretary')
  @ApiOperation({ summary: 'Gerar QR Code PIX estático' })
  createPix(@Param('id') id: string, @CurrentUser() user: { sub: string; role: string }) {
    return this.billing.createPix(id, user).then((data) => ({ data }));
  }

  @Patch(':id/mark-paid')
  @Roles('secretary', 'admin', 'psychologist')
  @ApiOperation({ summary: 'Marcar cobrança como paga' })
  markPaid(@Param('id') id: string, @CurrentUser() user: { sub: string; role: string }) {
    return this.billing.markPaid(id, user).then((data) => ({ data }));
  }

  @Post('webhooks/pix')
  @UseGuards()
  @ApiOperation({ summary: 'Webhook de notificação PIX (público)' })
  webhook(@Body() body: WebhookPixDto) {
    return this.billing.webhookPix(body);
  }
}

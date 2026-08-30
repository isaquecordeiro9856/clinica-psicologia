import { IsString, IsNumber, IsOptional, IsDateString, IsIn, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateBillingDto {
  @ApiPropertyOptional({ description: 'Valor em reais' })
  @IsNumber()
  @Min(0.01)
  @IsOptional()
  amount?: number;

  @ApiPropertyOptional({ enum: ['pix', 'card', 'boleto', 'cash', 'transfer'] })
  @IsString()
  @IsOptional()
  method?: string;

  @ApiPropertyOptional({ description: 'Data de vencimento (YYYY-MM-DD)' })
  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @ApiPropertyOptional({ enum: ['pending', 'paid', 'overdue', 'cancelled', 'refunded'] })
  @IsIn(['pending', 'paid', 'overdue', 'cancelled', 'refunded'])
  @IsOptional()
  status?: string;
}

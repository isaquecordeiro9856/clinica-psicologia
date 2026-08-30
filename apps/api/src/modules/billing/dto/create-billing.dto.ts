import { IsString, IsNumber, IsOptional, IsDateString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBillingDto {
  @ApiProperty({ description: 'ID do paciente' })
  @IsString()
  patientId!: string;

  @ApiProperty({ description: 'Valor em reais', example: 200 })
  @IsNumber()
  @Min(0.01)
  amount!: number;

  @ApiPropertyOptional({ enum: ['pix', 'card', 'boleto', 'cash', 'transfer'], default: 'pix' })
  @IsString()
  @IsOptional()
  method?: string;

  @ApiPropertyOptional({ description: 'Data de vencimento (YYYY-MM-DD)' })
  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @ApiPropertyOptional({ description: 'ID do agendamento relacionado' })
  @IsString()
  @IsOptional()
  appointmentId?: string;

  @ApiPropertyOptional({ description: 'Descricao da cobranca' })
  @IsString()
  @IsOptional()
  description?: string;
}

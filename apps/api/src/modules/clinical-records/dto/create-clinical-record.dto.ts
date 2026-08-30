import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateClinicalRecordDto {
  @ApiProperty({ example: 'Sessão de terapia cognitivo-comportamental...' })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  content: string;

  @ApiPropertyOptional({ example: 'uuid-do-agendamento' })
  @IsString()
  @IsOptional()
  appointmentId?: string;

  @ApiPropertyOptional({ example: 'session', enum: ['session', 'evaluation', 'evolution', 'report'] })
  @IsString()
  @IsOptional()
  type?: string;
}

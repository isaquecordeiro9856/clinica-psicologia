import { IsOptional, IsString, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateClinicalRecordDto {
  @ApiPropertyOptional({ example: 'Nota atualizada do paciente...' })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiPropertyOptional({ enum: ['evolution', 'anamnesis', 'assessment'] })
  @IsEnum(['evolution', 'anamnesis', 'assessment'] as const)
  @IsOptional()
  type?: 'evolution' | 'anamnesis' | 'assessment';
}

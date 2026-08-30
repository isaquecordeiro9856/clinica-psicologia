import { IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CancelAppointmentDto {
  @ApiPropertyOptional({ example: 'Paciente solicitou cancelamento' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  reason?: string;
}

import { IsISO8601, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAppointmentDto {
  @ApiProperty({ example: 'uuid-do-paciente' })
  @IsString()
  @IsNotEmpty()
  patientId: string;

  @ApiProperty({ example: 'uuid-do-psicologo', required: false })
  @IsString()
  @IsOptional()
  psychologistId: string;

  @ApiProperty({ example: 'uuid-do-servico' })
  @IsString()
  @IsNotEmpty()
  serviceId: string;

  @ApiProperty({ example: '2026-08-28T10:00:00.000Z' })
  @IsISO8601()
  @IsNotEmpty()
  startAt: string;

  @ApiProperty({ example: '2026-08-28T11:00:00.000Z' })
  @IsISO8601()
  @IsNotEmpty()
  endAt: string;
}

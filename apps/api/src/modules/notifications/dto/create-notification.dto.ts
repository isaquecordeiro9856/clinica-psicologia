import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateNotificationDto {
  @ApiProperty({ example: 'uuid-do-paciente' })
  @IsString()
  @IsNotEmpty()
  patientId: string;

  @ApiPropertyOptional({ example: 'uuid-do-agendamento' })
  @IsString()
  @IsOptional()
  appointmentId?: string;

  @ApiProperty({ example: 'email', enum: ['email', 'telegram', 'sms'] })
  @IsEnum(['email', 'telegram', 'sms'])
  @IsNotEmpty()
  channel: string;

  @ApiProperty({ example: 'appointment_reminder' })
  @IsString()
  @IsNotEmpty()
  template: string;

  @ApiPropertyOptional({ example: 'Lembrete de consulta amanhã às 10h' })
  @IsString()
  @IsOptional()
  payload?: string;
}

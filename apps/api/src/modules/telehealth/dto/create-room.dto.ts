import { IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTelehealthRoomDto {
  @ApiProperty({ example: 'uuid-do-agendamento' })
  @IsUUID()
  @IsNotEmpty()
  appointmentId: string;
}
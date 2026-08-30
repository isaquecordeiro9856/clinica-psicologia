import { IsISO8601, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RescheduleAppointmentDto {
  @ApiProperty({ example: '2026-08-29T10:00:00.000Z' })
  @IsISO8601()
  @IsNotEmpty()
  startAt: string;

  @ApiProperty({ example: '2026-08-29T11:00:00.000Z' })
  @IsISO8601()
  @IsNotEmpty()
  endAt: string;
}

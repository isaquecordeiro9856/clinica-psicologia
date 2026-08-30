import { IsDateString, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AvailabilityQueryDto {
  @ApiProperty({ example: 'uuid-do-psicologo' })
  @IsString()
  @IsNotEmpty()
  psychologistId: string;

  @ApiProperty({ example: '2026-08-28' })
  @IsDateString()
  @IsNotEmpty()
  from: string;

  @ApiProperty({ example: '2026-09-03' })
  @IsDateString()
  @IsNotEmpty()
  to: string;
}

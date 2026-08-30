import { IsDateString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReportQueryDto {
  @ApiProperty({ example: '2026-08-01' })
  @IsDateString()
  @IsNotEmpty()
  from: string;

  @ApiProperty({ example: '2026-08-31' })
  @IsDateString()
  @IsNotEmpty()
  to: string;
}

import { IsDateString, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ListAppointmentsDto {
  @ApiPropertyOptional({ default: 1 })
  @Type(() => Number)
  @Min(1)
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ default: 20 })
  @Type(() => Number)
  @Min(1)
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({ example: '2026-08-01' })
  @IsDateString()
  @IsOptional()
  from?: string;

  @ApiPropertyOptional({ example: '2026-08-31' })
  @IsDateString()
  @IsOptional()
  to?: string;

  @ApiPropertyOptional({ example: 'confirmed' })
  @IsString()
  @IsOptional()
  status?: string;
}

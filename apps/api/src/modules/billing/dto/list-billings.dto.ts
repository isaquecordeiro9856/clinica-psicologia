import { IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ListBillingsDto {
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

  @ApiPropertyOptional({ example: 'pending' })
  @IsString()
  @IsOptional()
  status?: string;
}

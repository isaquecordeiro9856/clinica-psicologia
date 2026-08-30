import { IsIP, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateConsentDto {
  @ApiProperty({ example: 'treatment' })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({ example: '1.0' })
  @IsString()
  @IsNotEmpty()
  version: string;

  @ApiProperty({ example: 'Termo de consentimento para tratamento...' })
  @IsString()
  @IsNotEmpty()
  textSnapshot: string;

  @ApiPropertyOptional({ example: '192.168.1.1' })
  @IsIP()
  @IsOptional()
  ip?: string;
}

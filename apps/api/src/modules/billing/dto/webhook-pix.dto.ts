import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class WebhookPixDto {
  @ApiProperty({ example: 'txid-123' })
  @IsString()
  @IsNotEmpty()
  txid: string;

  @ApiProperty({ example: 'CONCLUIDA' })
  @IsString()
  @IsNotEmpty()
  status: string;

  @ApiProperty({ example: 'evt-456' })
  @IsString()
  @IsNotEmpty()
  eventId: string;
}

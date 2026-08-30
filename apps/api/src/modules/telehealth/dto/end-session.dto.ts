import { IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class EndTelehealthSessionDto {
  @ApiProperty({ example: 'uuid-da-sessao' })
  @IsUUID()
  @IsNotEmpty()
  sessionId: string;
}
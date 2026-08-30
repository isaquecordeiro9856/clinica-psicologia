import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDocumentDto {
  @ApiProperty({ example: 'comprovante-pagamento.pdf' })
  @IsString()
  @IsNotEmpty()
  fileName: string;

  @ApiProperty({ example: 'clinica-docs/patient-123/file.pdf' })
  @IsString()
  @IsNotEmpty()
  s3Key: string;

  @ApiProperty({ example: 'application/pdf' })
  @IsString()
  @IsNotEmpty()
  mimeType: string;

  @ApiProperty({ example: 102400 })
  @IsInt()
  @Min(1)
  @Max(50_000_000)
  sizeBytes: number;

  @ApiProperty({ example: 'document', enum: ['document', 'consent', 'prescription', 'report'] })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiPropertyOptional({ default: false })
  @IsBoolean()
  @IsOptional()
  isClinical?: boolean;
}

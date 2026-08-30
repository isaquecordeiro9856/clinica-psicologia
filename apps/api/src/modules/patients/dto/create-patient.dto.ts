import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePatientDto {
  @ApiProperty({ example: 'Maria da Silva' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name: string;

  @ApiPropertyOptional({ example: '52998224725' })
  @IsString()
  @IsOptional()
  @Matches(/^\d{11}$/, { message: 'CPF must contain exactly 11 digits' })
  cpf?: string;

  @ApiPropertyOptional({ example: '11999998888' })
  @IsString()
  @IsOptional()
  @Matches(/^\d{10,11}$/, { message: 'Phone must contain 10-11 digits' })
  phone?: string;

  @ApiPropertyOptional({ example: 'maria@email.com' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: '1990-05-15' })
  @IsString()
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'birthDate must be YYYY-MM-DD format' })
  birthDate?: string;
}

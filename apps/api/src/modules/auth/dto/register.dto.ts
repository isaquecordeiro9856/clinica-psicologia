import { IsEmail, IsNotEmpty, IsString, MinLength, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'paciente@clinica.app' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'Senha123!' })
  @IsString()
  @MinLength(8)
  @IsNotEmpty()
  password: string;

  @ApiProperty({ example: 'João da Silva' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Aceite do termo LGPD' })
  @IsBoolean()
  @IsNotEmpty()
  lgpdConsent: boolean;
}

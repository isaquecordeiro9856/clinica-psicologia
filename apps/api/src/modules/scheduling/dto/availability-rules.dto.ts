import { ArrayNotEmpty, IsArray, IsInt, IsNotEmpty, IsString, Max, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class AvailabilityRuleDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(0)
  @Max(6)
  weekday: number;

  @ApiProperty({ example: '09:00' })
  @IsString()
  @IsNotEmpty()
  startTime: string;

  @ApiProperty({ example: '18:00' })
  @IsString()
  @IsNotEmpty()
  endTime: string;

  @ApiProperty({ example: 50 })
  @IsInt()
  @Min(15)
  @Max(180)
  slotDuration: number;
}

export class UpdateAvailabilityRulesDto {
  @ApiProperty({ type: [AvailabilityRuleDto] })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => AvailabilityRuleDto)
  rules: AvailabilityRuleDto[];
}

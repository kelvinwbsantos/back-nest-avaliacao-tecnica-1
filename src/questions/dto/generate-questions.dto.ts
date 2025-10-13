import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, Min, Max, IsString } from 'class-validator';

export class GenerateQuestionsDto {
  @ApiProperty({ 
    description: 'Número de questões a gerar',
    minimum: 1,
    maximum: 50,
    default: 10
  })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(50)
  @IsOptional()
  quantity?: number = 10;

  @ApiProperty({ 
    description: 'Meses de validade das questões',
    default: 12
  })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsOptional()
  validity_months?: number = 12;

  @ApiProperty({ example: "UUID da certificação relacionada" })
  @IsString()
  certificationId: string;
}
import { IsOptional, IsNumberString, IsEmail, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class PaginationDto {
  @ApiProperty({
    description: 'Número da página',
    required: false,
    default: 1,
  })
  @IsOptional()
  @IsNumberString()
  page?: number;

  @ApiProperty({
    description: 'Quantidade de itens por página',
    required: false,
    default: 10,
  })
  @IsOptional()
  @IsNumberString()
  limit?: number;

  @ApiProperty({
    description: 'Pesquisar por email',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    description: 'Pesquisar por nome',
    required: false,
  })
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'Pesquisar por CPF (com e sem máscara)',
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => value.replace(/\D/g, ''))
  @Matches(/^\d{11}$/, { message: 'CPF deve conter exatamente 11 dígitos numéricos.' })
  cpf?: string;
}
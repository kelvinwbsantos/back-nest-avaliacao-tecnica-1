// src/users/dto/update-user.dto.ts
import { IsOptional, IsString, IsEmail, Length, Matches } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({ description: 'Nome completo do usuário' })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  name?: string;

  @ApiPropertyOptional({ description: 'Email do usuário' })
  @IsOptional()
  @IsEmail()
  @Length(1, 100)
  email?: string;

  @ApiPropertyOptional({ description: 'Telefone com DDD (apenas números)' })
  @IsOptional()
  @IsString()
  @Length(10, 11)
  @Matches(/^\d{10,11}$/, { message: 'Telefone deve ter 10 ou 11 dígitos' })
  phonenumber?: string;

  @ApiPropertyOptional({ description: 'CEP (apenas números)' })
  @IsOptional()
  @IsString()
  @Length(8, 8)
  @Matches(/^\d{8}$/, { message: 'CEP deve ter exatamente 8 dígitos' })
  cep?: string;

  @ApiPropertyOptional({ description: 'Sigla do estado (ex: SP, RJ)' })
  @IsOptional()
  @IsString()
  @Length(2, 2)
  uf?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 30)
  city?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 40)
  neighborhood?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 100)
  street?: string;

  @ApiPropertyOptional({ description: 'Nova senha (será hasheada)' })
  @IsOptional()
  @IsString()
  @Length(6, 100)
  password?: string;
}
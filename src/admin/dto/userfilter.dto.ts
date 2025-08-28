import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UserFilterDto {
  @ApiProperty({
    required: false,
    description: 'Filtrar usuários pelo nome',
    example: 'João da Silva',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    required: false,
    description: 'Filtrar usuários pelo e-mail',
    example: 'joao@email.com',
  })
  @IsOptional()
  @IsString()
  email?: string;
  
  @ApiProperty({
    required: false,
    description: 'Filtrar usuários pelo CPF',
    example: '12345678901',
  })
  @IsOptional()
  @IsString()
  cpf?: string;
}
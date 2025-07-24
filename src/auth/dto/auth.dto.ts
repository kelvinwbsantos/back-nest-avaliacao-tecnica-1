import { IsString, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    description: 'CPF do usuário no formato 000.000.000-00',
    example: '123.456.789-00',
  })
  @IsString()
  @Matches(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, {
    message: 'CPF deve estar no formato 000.000.000-00',
  })
  cpf!: string;

  @ApiProperty({
    description: 'Senha do usuário com pelo menos 8 caracteres, incluindo letras maiúsculas, minúsculas, números e caracteres especiais',
    example: 'Senha@1234',
  })
  @IsString()
  @MinLength(8)
  @Matches(/(?=.*[a-z])/, { message: 'Deve conter ao menos uma letra minúscula' })
  @Matches(/(?=.*[A-Z])/, { message: 'Deve conter ao menos uma letra maiúscula' })
  @Matches(/(?=.*\d)/, { message: 'Deve conter ao menos um número' })
  @Matches(/(?=.*[\W_])/, { message: 'Deve conter ao menos um caractere especial' })
  password!: string;
}

export class LoginDto {
  @ApiProperty({
    description: 'CPF do usuário no formato 000.000.000-00',
    example: '123.456.789-00',
  })
  @IsString()
  @Matches(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, {
    message: 'CPF deve estar no formato 000.000.000-00',
  })
  cpf!: string;

  @ApiProperty({
    description: 'Senha do usuário',
    example: 'Senha@1234',
  })
  @IsString()
  password!: string;
}

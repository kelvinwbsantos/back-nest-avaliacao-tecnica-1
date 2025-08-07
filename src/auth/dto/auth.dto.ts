import { IsString, MinLength, Matches, Length, IsEmail, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class RegisterDto {
  @ApiProperty({
    description: 'Token de convite fornecido para o registro do usuário.',
    example: 'a12b3c4d5f6g7h8i9j0k',
  })
  @IsString()
  token!: string;

  @ApiProperty({
    description: 'CPF do usuário, que pode ser enviado com ou sem máscara.',
    example: '123.456.678-90',
  })
  @Transform(({ value }) => value.replace(/\D/g, ''))
  @Matches(/^\d{11}$/, { message: 'CPF deve conter exatamente 11 dígitos numéricos.' })
  cpf!: string;

  @ApiProperty({
    description: 'Nome completo do usuário.',
    example: 'John Doe',
  })
  @IsString()
  name!: string;

  @ApiProperty({
    description: 'Endereço de e-mail do usuário',
    example: 'johndoe@example.com',
  })
  @IsEmail({}, { message: 'Formato de e-mail inválido.' })
  email!: string;

  @ApiProperty({
    description: 'Número de telefone do usuário (opcional), podendo ser enviado com ou sem máscara.',
    example: '(12) 12345-1234',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.replace(/\D/g, ''))
  phonenumber?: string;

  @ApiProperty({
    description: 'CEP do endereço do usuário (opcional), que pode ser enviado com ou sem o hífen.',
    example: '12345-678',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.replace('-', ''))
  @Matches(/^\d{8}$/, { message: 'CEP deve conter exatamente 8 dígitos numéricos.' })
  cep?: string;

  @ApiProperty({
    description: 'Unidade Federativa (estado) do endereço do usuário (opcional), com 2 letras.',
    example: 'AL',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(2, 2)
  uf?: string;

  @ApiProperty({
    description: 'Cidade do endereço do usuário (opcional).',
    example: 'Maceió',
    required: false,
  })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({
    description: 'Bairro do endereço do usuário (opcional).',
    example: 'Pajuçara',
    required: false,
  })
  @IsOptional()
  @IsString()
  neighborhood?: string;

  @ApiProperty({
    description: 'Rua do endereço do usuário (opcional).',
    example: 'Rua dos Bobos',
    required: false,
  })
  @IsOptional()
  @IsString()
  street?: string;

  @ApiProperty({
    description: 'Senha do usuário. Deve ter pelo menos 8 caracteres, incluindo letras maiúsculas, minúsculas, números e caracteres especiais.',
    example: 'Senha@1234',
  })
  @IsString()
  @MinLength(8, { message: 'A senha deve ter no mínimo 8 caracteres.' })
  @Matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/, {
    message: 'A senha deve conter ao menos uma letra minúscula, uma maiúscula, um número e um caractere especial.',
  })
  password!: string;
}

export class LoginDto {
  @ApiProperty({
    description: 'CPF do usuário, que pode ser enviado com ou sem máscara.',
    example: '123.456.678-90',
  })
  @Transform(({ value }) => value.replace(/\D/g, ''))
  @Matches(/^\d{11}$/, { message: 'CPF deve conter exatamente 11 dígitos numéricos.' })
  cpf!: string;

  @ApiProperty({
    description: 'Senha do usuário. Deve ter pelo menos 8 caracteres, incluindo letras maiúsculas, minúsculas, números e caracteres especiais.',
    example: 'Senha@1234',
  })
  @IsString()
  @MinLength(8, { message: 'A senha deve ter no mínimo 8 caracteres.' })
  @Matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/, {
    message: 'A senha deve conter ao menos uma letra minúscula, uma maiúscula, um número e um caractere especial.',
  })
  password!: string;
}
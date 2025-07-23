import { IsString, MinLength, Matches, MaxLength } from 'class-validator';

export class RegisterDto {
  @IsString()
  @Matches(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, {
    message: 'CPF deve estar no formato 000.000.000-00',
  })
  cpf!: string;

  @IsString()
  @MinLength(8)
  @Matches(/(?=.*[a-z])/, { message: 'Deve conter ao menos uma letra minúscula' })
  @Matches(/(?=.*[A-Z])/, { message: 'Deve conter ao menos uma letra maiúscula' })
  @Matches(/(?=.*\d)/, { message: 'Deve conter ao menos um número' })
  @Matches(/(?=.*[\W_])/, { message: 'Deve conter ao menos um caractere especial' })
  password!: string;
}

export class LoginDto {
  @IsString()
  @Matches(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, {
    message: 'CPF deve estar no formato 000.000.000-00',
  })
  cpf!: string;

  @IsString()
  password!: string;
}

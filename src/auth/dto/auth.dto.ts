import { IsString, MinLength, Matches } from 'class-validator';

export class RegisterDto {
  @IsString()
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
  cpf!: string;

  @IsString()
  password!: string;
}

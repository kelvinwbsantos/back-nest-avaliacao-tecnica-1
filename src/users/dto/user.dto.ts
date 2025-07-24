import { IsString, MinLength, Matches } from 'class-validator';

export class CreateUserDto {
  @IsString()
  cpf: string;

  @IsString()
  @MinLength(8)
  @Matches(/(?=.*[a-z])/, { message: 'Deve conter letra minúscula' })
  @Matches(/(?=.*[A-Z])/, { message: 'Deve conter letra maiúscula' })
  @Matches(/(?=.*\d)/, { message: 'Deve conter número' })
  @Matches(/(?=.*[\W_])/, { message: 'Deve conter caractere especial' })
  password: string;
}

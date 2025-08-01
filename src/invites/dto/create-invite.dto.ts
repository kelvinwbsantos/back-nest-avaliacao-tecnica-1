import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateInviteDto {
  @ApiProperty({ example: 'usuario@exemplo.com', description: 'Email do convidado' })
  @IsEmail({}, { message: 'Por favor, insira um e-mail válido.' })
  @IsNotEmpty({ message: 'O e-mail é obrigatório.' })
  email: string;

  @ApiProperty({ example: 'admin@exemplo.com', description: 'identificador do remetente'})
  @IsNotEmpty()
  sender: string;
}
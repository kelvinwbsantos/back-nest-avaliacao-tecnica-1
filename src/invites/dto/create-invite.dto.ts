import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateInviteDto {
  @ApiProperty({ example: 'johndoe@example.com', description: 'Email do convidado' })
  @IsEmail({}, { message: 'Por favor, insira um e-mail válido.' })
  email: string;

  @ApiProperty({ example: 'admin@example.com', description: 'Email do remetente' })
  @IsNotEmpty()
  sender: string;
}
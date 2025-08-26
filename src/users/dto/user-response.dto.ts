import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { IsString, IsEmail, Length, Matches } from 'class-validator';
import { User } from '../entities/user.entity';

export class UserRespondeDto {
  @ApiProperty({ example: '1'})
  id: number;

  @ApiProperty({ example: 'João Silva' })
  name: string;

  @ApiProperty({ example: 'joao@email.com' })
  email: string;

  @ApiProperty({ example: '12345678900' })
  cpf: string;

  @ApiProperty({ example: '11987654321' })
  phonenumber?: string;

  @ApiProperty({ example: '12345678' })
  cep?: string;

  @ApiProperty({ example: 'SP' })
  uf?: string;

  @ApiProperty({ example: 'São Paulo' })
  city?: string;

  @ApiProperty({ example: 'Centro' })
  neighborhood?: string;

  @ApiProperty({ example: 'Rua das Flores' })
  street?: string;

  @ApiProperty({ example: 'Colaborador' })
  role?: string;
  

    /**
   * O construtor é a chave para um mapeamento limpo.
   * Ele recebe a entidade 'User' e atribui apenas os campos
   * definidos neste DTO, omitindo a senha automaticamente.
   */
  constructor(user: User) {
    this.id = user.id;
    this.name = user.name;
    this.email = user.email;
    this.cpf = user.cpf;
    this.phonenumber = user.phonenumber;
    this.cep = user.cep;
    this.uf = user.uf;
    this.city = user.city;
    this.neighborhood = user.neighborhood;
    this.street = user.street;
    this.role = user.role ? user.role.name : undefined;
  }
}

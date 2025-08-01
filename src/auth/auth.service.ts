import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { InvitesService } from 'src/invites/invites.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly invitesService: InvitesService
  ) { }

  async register(cpf: string, password: string): Promise<User> {
    const createUserDto = { cpf, password };
    return this.usersService.create(createUserDto);
  }

  async validateUser(cpf: string, password: string): Promise<{ access_token: string }> {

    const user = await this.usersService.findByCpf(cpf);
    if (!user) {
      throw new UnauthorizedException('CPF ou senha inválidos');
    }

    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) {
      throw new UnauthorizedException('CPF ou senha inválidos');
    }

    const payload = { sub: user.id, cpf: user.cpf, role: user.role.name };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}

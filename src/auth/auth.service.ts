import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { InvitesService } from 'src/invites/invites.service';
import { CreateUserDto } from 'src/users/dto/user.dto';
import { LoginDto, RegisterDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly invitesService: InvitesService
  ) { }

  async register(registerDto: RegisterDto): Promise<User> {
    const { token, ...registerDtoWithoutToken } = registerDto;

    this.invitesService.completeInvite(token);

    const cleanCpf = registerDto.cpf.replace(/\D/g, '');
    const cleanPhonenumber = registerDto.phonenumber?.replace(/\D/g, '');
    const cleanCep = registerDto.cep?.replace(/\D/g, '');

    const createUserDto: CreateUserDto = {
      ...registerDtoWithoutToken,
      cpf: cleanCpf,
      phonenumber: cleanPhonenumber,
      cep: cleanCep
    }

    return this.usersService.create(createUserDto);
  }

  async login(loginDto: LoginDto): Promise<{ access_token: string }> {

    const cpf = loginDto.cpf.replace(/\D/g, '');
    const password = loginDto.password;

    const user = await this.usersService.findByCpf(cpf);
    if (!user) {
      throw new UnauthorizedException('CPF ou senha inválidos');
    }

    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) {
      throw new UnauthorizedException('CPF ou senha inválidos');
    }

    const payload = { sub: user.id, email: user.email, role: user.role.name };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}

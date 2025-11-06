import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { InvitesService } from 'src/invites/invites.service';
import { CreateUserDto } from 'src/users/dto/user.dto';
import { RegisterDto, LoginDto, MinimalRegisterDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly invitesService: InvitesService
  ) { }

  async register(registerDto: RegisterDto): Promise<String> {
    const { token, ...registerDtoWithoutToken } = registerDto;

    try { this.invitesService.validate(token) } catch (error) {
      throw new UnauthorizedException('Token de convite inválido ou expirado');
    }

    const createUserDto: CreateUserDto = {
      ...registerDtoWithoutToken,
    }

    const user = await this.usersService.create(createUserDto);

    this.invitesService.completeInvite(token);
    
    return user.cpf;
  }

  async registerWithoutInvitation(registerDto: MinimalRegisterDto): Promise<String> {
    const createUserDto: CreateUserDto = {
      ...registerDto,
      name: '',
    }

    const user = await this.usersService.create(createUserDto);
    return user.cpf;
  }

  async login(loginDto: LoginDto): Promise<{ access_token: string }> {

    const { cpf, password } = loginDto;

    const user = await this.usersService.findByCpf(cpf);
    if (!user) {
      throw new UnauthorizedException('CPF ou senha inválidos');
    }

    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) {
      throw new UnauthorizedException('CPF ou senha inválidos');
    }

    const payload = { sub: user.id, name: user.name, email: user.email, role: user.role.name };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}

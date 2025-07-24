import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) { }

  async register(cpf: string, password: string): Promise<User> {

    const exists = await this.usersRepository.findOne({ where: { cpf } });
    if (exists) {
      throw new BadRequestException('Usuário com este CPF já existe.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // TODO: separar lógica de criação de usuário em um módulo próprio!
    const user = this.usersRepository.create({
      cpf,
      password: hashedPassword,
    });

    return this.usersRepository.save(user);
  }

  async validateUser(cpf: string, password: string): Promise<{ access_token: string }> {

    const user = await this.usersRepository.findOne({ where: { cpf } });
    if (!user) {
      throw new UnauthorizedException('CPF ou senha inválidos');
    }

    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) {
      throw new UnauthorizedException('CPF ou senha inválidos');
    }

    const payload = { sub: user.id, cpf: user.cpf };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}

import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) { }

  // Função que valida e formata CPF
  formatCPF(cpf: string): string {
    const digits = cpf.replace(/\D/g, '');
    if (digits.length !== 11) {
      throw new BadRequestException('CPF deve conter 11 dígitos.');
    }
    return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  async register(cpf: string, password: string): Promise<User> {

    const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
    if (!cpfRegex.test(cpf)) {
      throw new BadRequestException('CPF deve estar no formato 000.000.000-00');
    }

    const formattedCpf = this.formatCPF(cpf);

    const exists = await this.usersRepository.findOne({ where: { cpf: formattedCpf } });
    if (exists) {
      throw new BadRequestException('Usuário com este CPF já existe.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = this.usersRepository.create({
      cpf: formattedCpf,
      password: hashedPassword,
    });

    return this.usersRepository.save(user);
  }

  async validateUser(cpf: string, password: string): Promise<User> {
    const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
    if (!cpfRegex.test(cpf)) {
      throw new BadRequestException('CPF deve estar no formato 000.000.000-00');
    }

    const user = await this.usersRepository.findOne({ where: { cpf } });
    if (!user) {
      throw new UnauthorizedException('CPF ou senha inválidos');
    }

    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) {
      throw new UnauthorizedException('CPF ou senha inválidos');
    }

    return user;
  }
}

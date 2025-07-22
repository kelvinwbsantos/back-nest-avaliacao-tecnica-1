import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}
  
  async register(cpf: string, password: string): Promise<User> {
    const existingUser = await this.userRepository.findOneBy({ cpf });

    if (existingUser) {
      throw new ConflictException('CPF já cadastrado');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const cpfSemMascara = cpf.replace(/\D/g, '');
    const user = this.userRepository.create({ cpf: cpfSemMascara, password: hashedPassword });
    return this.userRepository.save(user);
  }

    async login(cpf: string, password: string): Promise<User> {
    const user = await this.userRepository.findOneBy({ cpf });

    if (!user) {
      throw new UnauthorizedException('CPF ou senha inválidos');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('CPF ou senha inválidos');
    }

    return user;
  }

  findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

}

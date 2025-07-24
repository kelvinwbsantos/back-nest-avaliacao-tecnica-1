import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/user.dto';
import * as bcrypt from 'bcrypt';
import { Role } from 'src/roles/entities/role.entity';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,

        @InjectRepository(Role)
        private readonly rolesRepository: Repository<Role>,
    ) { }

    async create(createUserDto: CreateUserDto): Promise<User> {
        const { cpf, password } = createUserDto;

        const exists = await this.usersRepository.findOne({ where: { cpf } });
        if (exists) {
            throw new BadRequestException('User with this CPF already exists');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const colaboradorRole = await this.rolesRepository.findOne({
            where: { name: 'colaborador' },
        })
        if (!colaboradorRole) {
            throw new BadRequestException('Role "colaborador" does not exist');
        }
        
        const user = this.usersRepository.create({
            cpf,
            password: hashedPassword,
            role: colaboradorRole,
        });

        return this.usersRepository.save(user);
    }

    async findByCpf(cpf: string): Promise<User | null> {
        return this.usersRepository.findOne({ where: { cpf }, relations: ['role'] });
    }
}

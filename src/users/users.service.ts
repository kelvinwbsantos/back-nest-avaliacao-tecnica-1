import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { FindManyOptions, ILike, Like, Repository } from 'typeorm';
import { CreateUserDto } from './dto/user.dto';
import * as bcrypt from 'bcrypt';
import { Role } from 'src/roles/entities/role.entity';
import { UserFilterDto } from 'src/admin/dto/userfilter.dto';
import * as XLSX from 'xlsx';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,

        @InjectRepository(Role)
        private readonly rolesRepository: Repository<Role>,
    ) { }

    /**
     * Cria um novo usuário com a role "colaborador".
     *
     * @param {CreateUserDto} createUserDto - DTO com dados do usuário.
     * @throws {BadRequestException} Se o CPF já existir ou a role estiver ausente.
     * @returns {Promise<User>} O usuário criado.
     */
    async create(createUserDto: CreateUserDto): Promise<User> {
        const { cpf, password } = createUserDto;

        const exists = await this.usersRepository.findOne({ where: { cpf } });
        if (exists) {
            throw new BadRequestException('User with this CPF already exists');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const colaboradorRole = await this.rolesRepository.findOne({
            where: { name: 'colaborador' },
        });

        if (!colaboradorRole) {
            throw new BadRequestException('Role "colaborador" does not exist');
        }

        const user = this.usersRepository.create({
            ...createUserDto,
            password: hashedPassword,
            role: colaboradorRole,
        });

        return this.usersRepository.save(user);
    }

    /**
     * Busca um usuário pelo CPF e retorna com a role.
     *
     * @param {string} cpf - CPF do usuário.
     * @returns {Promise<User | null>} Usuário encontrado ou null.
     */
    async findByCpf(cpf: string): Promise<User | null> {
        return this.usersRepository.findOne({ where: { cpf }, relations: ['role'] });
    }

    /**
     * Busca um usuário pelo CPF e retorna com a role.
     *
     * @param {string} userId - Id do usuário no banco de dados.
     * @returns {Promise<User | null>} Usuário encontrado ou null.
     */
    async findById(userId: number): Promise<User | null> {
        return this.usersRepository.findOne({ where: { id: userId }, relations: ['role'] });
    }

    /**
     * Busca todos os usuários com paginação e filtros opcionais.
     *
     * @param {number} page - Número da página.
     * @param {number} limit - Limite de itens por página.
     * @param {string} [name] - Nome para filtro opcional.
     * @param {string} [email] - Email para filtro opcional.
     * @param {string} [cpf] - CPF para filtro opcional.
     * @returns {Promise<{ data: User[], total: number }>} Lista de usuários e total.
     */
    async findAll(page?: number, limit?: number, name?: string, email?: string, cpf?: string): Promise<{ data: User[], total: number }> {
        const skip = page && limit ? (page - 1) * limit : 0;

        const where: any = {};

        if (name) {
            where.name = ILike(`%${name}%`);
        }
        if (email) {
            where.email = Like(`%${email}%`);
        }
        if (cpf) {
            where.cpf = Like(`%${cpf}%`);
        }

        const findOptions: FindManyOptions<User> = {
            order: {
                name: 'ASC',
            },
            skip: skip,
            take: limit ?? undefined,
            where: where,
            select: ['id', 'name', 'email', 'cpf'],
        };

        const [data, total] = await this.usersRepository.findAndCount(findOptions);

        return {
            data,
            total,
        };
    }

    async exportToExcel(filters: UserFilterDto): Promise<{ buffer: Buffer; fileName: string }> {
        const users = await this.findAll(undefined, undefined, filters.name, filters.email, filters.cpf).then(res => res.data);

        const mappedData = users.map(user => ({
        'Nome': user.name,
        'E-mail': user.email,
        'CPF': user.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4'),
        }));

        const worksheet = XLSX.utils.json_to_sheet(mappedData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Usuários');
        
        const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
        const fileName = `Relatorio_Usuarios_${new Date().toISOString().split('T')[0]}.xlsx`;

        return { buffer, fileName };
  }
}

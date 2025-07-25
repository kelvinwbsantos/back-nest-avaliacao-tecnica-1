import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { Repository } from 'typeorm';
import { CreateRoleDto } from './dto/role.dto';

/**
 * Serviço responsável por gerenciar 'roles' no sistema.
 */
@Injectable()
export class RolesService {
    constructor(
        @InjectRepository(Role)
        private readonly rolesRepository: Repository<Role>,
    ) { }

    /**
     * Cria uma nova 'role' após validar se o nome já não está em uso.
     * 
     * - O nome é normalizado (sem espaços, minúsculo, com `_` entre palavras).
     * - Verifica se já existe uma 'role' com esse nome.
     * - Lança um erro se o nome já estiver registrado.
     * - Cria e salva a nova entidade 'Role' no banco de dados.
     * 
     * @param {CreateRoleDto} createRoleDto - Dados para criação da 'role'
     * @returns {Promise<Role>} A 'role' criada
     * @throws {BadRequestException} Se o nome já estiver em uso
     */
    async create(createRoleDto: CreateRoleDto): Promise<Role> {
        const nameNormalized = createRoleDto.name.trim().toLowerCase().replace(/\s+/g, '_');

        const existinRole = await this.rolesRepository.findOne({
            where: { name: nameNormalized },
        });

        if (existinRole) {
            throw new BadRequestException(`Role with name ${nameNormalized} already exists`);
        }

        const role = this.rolesRepository.create({ name: nameNormalized, });
        return await this.rolesRepository.save(role);
    }
}

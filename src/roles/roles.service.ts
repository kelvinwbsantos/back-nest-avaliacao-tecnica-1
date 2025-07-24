import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { Repository } from 'typeorm';
import { CreateRoleDto } from './dto/role.dto';

@Injectable()
export class RolesService {
    constructor(
        @InjectRepository(Role)
        private readonly rolesRepository: Repository<Role>,
    ) {}

    async create(createRoleDto: CreateRoleDto): Promise<Role> {
        const nameNormalized = createRoleDto.name.trim().toLowerCase().replace(/\s+/g, '_');

        const existinRole = await this.rolesRepository.findOne({
            where: { name: nameNormalized },
        });

        if (existinRole) {
            throw new BadRequestException(`Role with name ${nameNormalized} already exists`);
        }

        const role = this.rolesRepository.create({name: nameNormalized,});
        return await this.rolesRepository.save(role);
    }
}

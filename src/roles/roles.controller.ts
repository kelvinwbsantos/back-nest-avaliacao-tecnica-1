import { Body, Controller, Post } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/role.dto';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('roles')
@Controller('roles')
export class RolesController {
    constructor(private readonly rolesService: RolesService) {}

    @Post('create')
    @ApiOperation({ summary: 'Create a new role' })
    @ApiBody({ type: CreateRoleDto })
    @ApiResponse({ status: 201, description: 'Role created successfully' })
    @ApiResponse({ status: 400, description: 'Bad Request' })
    async createRole(@Body() createRoleDto: CreateRoleDto) {
        return this.rolesService.create(createRoleDto);
    }
}

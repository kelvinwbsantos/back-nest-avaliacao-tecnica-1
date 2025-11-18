import { 
  Body, 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Param, 
  ParseIntPipe,
  Query 
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/role.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { Role } from './entities/role.entity';
import { UpdateRoleDto } from './dto/update-role.dto';

/**
 * Controller responsável por gerenciar os endpoints relacionados a 'roles'.
 */
@ApiTags('roles')
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  /**
   * Endpoint para criar uma nova 'role'.
   */
  @Post('create')
  @ApiOperation({ summary: 'Create a new role' })
  @ApiBody({ type: CreateRoleDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Role created successfully',
    type: Role
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 409, description: 'Role name already exists' })
  async createRole(@Body() createRoleDto: CreateRoleDto): Promise<Role> {
    return this.rolesService.create(createRoleDto);
  }

  /**
   * Endpoint para buscar todas as 'roles'.
   */
  @Get()
  @ApiOperation({ summary: 'Get all roles' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 10)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Roles retrieved successfully',
    type: [Role]
  })
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<{ data: Role[]; total: number; page: number; limit: number; totalPages: number }> {
    page = Math.max(1, Number(page));
    limit = Math.min(100, Math.max(1, Number(limit)));
    
    return this.rolesService.findAll(page, limit);
  }

  /**
   * Endpoint para buscar uma 'role' específica pelo ID.
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get a role by ID' })
  @ApiParam({ name: 'id', description: 'Role ID', type: Number })
  @ApiResponse({ 
    status: 200, 
    description: 'Role found',
    type: Role
  })
  @ApiResponse({ status: 404, description: 'Role not found' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Role> {
    return this.rolesService.findOne(id);
  }

  /**
   * Endpoint para atualizar uma 'role' específica pelo ID.
   */
  @Put(':id')
  @ApiOperation({ summary: 'Update a role by ID' })
  @ApiParam({ name: 'id', description: 'Role ID', type: Number })
  @ApiBody({ type: UpdateRoleDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Role updated successfully',
    type: Role
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  @ApiResponse({ status: 409, description: 'Role name already exists' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRoleDto: UpdateRoleDto
  ): Promise<Role> {
    return this.rolesService.update(id, updateRoleDto);
  }

  /**
   * Endpoint para excluir uma 'role' específica pelo ID.
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a role by ID' })
  @ApiParam({ name: 'id', description: 'Role ID', type: Number })
  @ApiResponse({ 
    status: 200, 
    description: 'Role deleted successfully'
  })
  @ApiResponse({ status: 404, description: 'Role not found' })
  @ApiResponse({ status: 409, description: 'Cannot delete role: users are associated with this role' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.rolesService.remove(id);
  }

  /**
   * Endpoint para buscar uma 'role' específica pelo nome.
   */
  @Get('name/:name')
  @ApiOperation({ summary: 'Get a role by name' })
  @ApiParam({ name: 'name', description: 'Role name' })
  @ApiResponse({ 
    status: 200, 
    description: 'Role found',
    type: Role
  })
  @ApiResponse({ status: 404, description: 'Role not found' })
  async findOneByName(@Param('name') name: string): Promise<Role> {
    return this.rolesService.findOneByName(name);
  }
}
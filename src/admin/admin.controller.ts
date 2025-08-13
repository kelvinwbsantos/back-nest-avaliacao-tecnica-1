import { ClassSerializerInterceptor, Controller, Get, NotFoundException, Param, ParseIntPipe, Query, UseInterceptors } from '@nestjs/common';
import { AdminService } from './admin.service';
import { UsersService } from 'src/users/users.service';
import { PaginationDto } from './dto/pagination.dto';
import { User } from 'src/users/entities/user.entity';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserRespondeDto } from 'src/users/dto/user-response.dto';

@ApiTags('Admin')
@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly usersService: UsersService
  ) { }

  @Get('users')
  @ApiOperation({ summary: 'Listar usuários com paginação e filtros' })
  @ApiResponse({ status: 200, description: 'Lista de usuários retornada com sucesso.' })
  async findAll(@Query() pagination: PaginationDto): Promise<{ data: User[], total: number }> {
    const page = pagination.page ? Number(pagination.page) : 1;
    const limit = pagination.limit ? Number(pagination.limit) : 10;
    const { name, email, cpf } = pagination;

    return this.usersService.findAll(page, limit, name, email, cpf);
  }

  @Get('user/:id') 
  @ApiOperation({ summary: 'Buscar um usuário pelo Id' })
  @ApiResponse({ status: 200, description: 'Usuário retornado com sucesso.', type: UserRespondeDto })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado.' })
  async findById(@Param('id', ParseIntPipe) id: number): Promise<UserRespondeDto> {
    const user = await this.usersService.findById(id);

    if (!user) {
      throw new NotFoundException(`Usuário com o ID "${id}" não encontrado.`);
    }

    return new UserRespondeDto(user);
  }

}
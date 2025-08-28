import { ClassSerializerInterceptor, Controller, Get, NotFoundException, Param, ParseIntPipe, Query, Res, UseInterceptors } from '@nestjs/common';
import { AdminService } from './admin.service';
import { UsersService } from 'src/users/users.service';
import { PaginationDto } from './dto/pagination.dto';
import { User } from 'src/users/entities/user.entity';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserRespondeDto } from 'src/users/dto/user-response.dto';
import { Response } from 'express';
import { UserFilterDto } from './dto/userfilter.dto';

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

  @Get('users/exportXlsx')
  @ApiOperation({ summary: 'Listar usuários com filtros e exportar como planilha' })
  @ApiResponse({
    status: 200,
    description: 'Arquivo Excel gerado com sucesso.',
    content: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {},
    },
  })
  async exportToExcel(
    @Query() filters: UserFilterDto,
    @Res() res: Response,
  ): Promise<void> {
    const { buffer, fileName } = await this.usersService.exportToExcel(filters);

    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

    res.send(buffer);
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
import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { InvitesService } from './invites.service';
import { CreateInviteDto } from './dto/create-invite.dto';
import { ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';


@ApiTags('Invites')
@Controller('invites')
export class InvitesController {
    constructor(private readonly invitesService: InvitesService) {}

    @Post()
    @ApiOperation({ summary: 'Criar um novo convite' })
    @ApiBody({ type: CreateInviteDto })
    @ApiResponse({ status: 201, description: 'Convite criado com sucesso' })
    @ApiResponse({ status: 409, description: 'Convite já existe para este email' })
    async create(@Body() createInviteDto: CreateInviteDto) {
        return await this.invitesService.createInvite(createInviteDto);
    }

    @Get('validate')
    @ApiOperation({ summary: 'Valida um token JWT de convite' })
    @ApiQuery({ name: 'token', required: true })
    @ApiResponse({ status: 200, description: 'Token é valido' })
    @ApiResponse({ status: 400, description: 'Token inválido ou expirado' })
    @ApiResponse({ status: 404, description: 'Convite não existe' })
    async validate(@Query('token') token: string) {
        return await this.invitesService.validate(token);
    }

    @Get()
    @ApiOperation({ summary: 'Busca convites enviados por um email com paginação' })
    @ApiQuery({ name: 'sender', required: true, description: 'Email do remetente dos convites' })
    @ApiQuery({ name: 'page', required: false, type: Number, description: 'Número da página' })
    @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Limite de convites por página' })
    @ApiResponse({ status: 200, description: 'Lista de convites retornada com sucesso' })
    @ApiResponse({ status: 404, description: 'Não existe convites enviados por este email' })
    async getInvites(
        @Query('sender') sender: string,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
    ) {
        return await this.invitesService.getInvites(Number(page), Number(limit), sender);
    }
}

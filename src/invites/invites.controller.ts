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
    @ApiResponse({ status: 201, description: 'Invite created succesfuly' })
    @ApiResponse({ status: 409, description: 'User already been invited.' })
    async create(@Body() createInviteDto: CreateInviteDto) {
        return await this.invitesService.createInvite(createInviteDto);
    }

    @Get('validateToken')
    @ApiOperation({ summary: 'Valida um token JWT de convite' })
    @ApiQuery({ name: 'token', required: true })
    @ApiResponse({ status: 200, description: 'Token é valido' })
    @ApiResponse({ status: 400, description: 'Invalid or expired token' })
    @ApiResponse({ status: 404, description: 'Invite not found' })
    async validate(@Query('token') token: string) {
        return await this.invitesService.validateToken(token);
    }
}

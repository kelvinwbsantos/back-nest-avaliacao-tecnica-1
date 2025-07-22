import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @UseGuards(JwtAuthGuard)
  @Post('register')
  register(
    @Body() body: { cpf: string; password: string },
  ) {
    return this.usersService.register(body.cpf, body.password);
  }

  @Post('login')
  login(
    @Body() body: { cpf: string; password: string },
  ) {
    return this.usersService.login(body.cpf, body.password);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }
}

import {
  Controller,
  Post,
  Body,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { LoginDto, RegisterDto } from './dto/auth.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('register')
  @ApiOperation({ summary: 'Registrar um novo usuário' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ status: 201, description: 'Usuário registrado com sucesso' })
  @ApiResponse({ status: 400, description: 'Usuário com este CPF já existe.' })
  async register(@Body(new ValidationPipe()) registerDto: RegisterDto) {
    const user = await this.authService.register(registerDto);
    return { message: 'Usuário registrado com sucesso', cpf: user.cpf };
  }

  @Post('login')
  @ApiOperation({ summary: 'Fazer login do usuário' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Login realizado com sucesso' })
  @ApiResponse({ status: 401, description: 'CPF ou senha inválidos' })
  async login(@Body(new ValidationPipe()) loginDto: LoginDto) {
    const user = await this.authService.login(loginDto);
    return {
      message: 'Login realizado com sucesso',
      access_token: user.access_token,
    };
  }
}

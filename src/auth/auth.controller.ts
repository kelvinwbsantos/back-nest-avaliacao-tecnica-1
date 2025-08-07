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

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('register')
  @ApiOperation({ summary: 'Registrar um novo usuário convidado' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ status: 201, description: 'Usuário registrado com sucesso' })
  @ApiResponse({ status: 400, description: 'Usuário com este CPF já existe' })
  @ApiResponse({ status: 401, description: 'Token de convite inválido ou expirado' })
  async register(@Body() registerDto: RegisterDto) {
    const cpf = await this.authService.register(registerDto);
    return { message: 'Usuário registrado com sucesso', cpf};
  }

  @Post('login')
  @ApiOperation({ summary: 'Fazer login do usuário' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Login realizado com sucesso' })
  @ApiResponse({ status: 401, description: 'CPF ou senha inválidos' })
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.login(loginDto);
    return {
      message: 'Login realizado com sucesso',
      access_token: user.access_token,
    };
  }
}

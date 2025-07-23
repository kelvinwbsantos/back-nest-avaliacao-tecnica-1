import { Controller, Post, Body, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { access } from 'fs';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body(new ValidationPipe()) registerDto: RegisterDto) {
    const user = await this.authService.register(registerDto.cpf, registerDto.password);
    return { message: 'Usuário registrado com sucesso', cpf: user.cpf };
  }

  @Post('login')
  async login(@Body(new ValidationPipe()) loginDto: LoginDto) {
    const user = await this.authService.validateUser(loginDto.cpf, loginDto.password);
    return { message: 'Login realizado com sucesso', access_token: user.access_token };
  }
}

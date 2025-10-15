import { Controller, Get, Post, Body, Param, UseGuards, Req, ParseUUIDPipe } from '@nestjs/common';
import { ExamsService } from './exams.service';
import { CreateExamDto } from './dto/create-exam.dto';
import { SubmitExamDto } from './dto/submit-answer.dto';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ExamResponseDto, ExamResultDto } from './dto/exam-response.dto';

@ApiTags('Exams')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('exams')
export class ExamsController {
  constructor(private readonly examsService: ExamsService) {}

  @Post()
  @ApiOperation({ summary: 'Iniciar um novo exame para uma certificação inscrita' })
  @ApiBody({ type: CreateExamDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Exame iniciado com sucesso',
    type: ExamResponseDto 
  })
  @ApiResponse({ status: 400, description: 'Já existe um exame em andamento ou inscrição inválida' })
  @ApiResponse({ status: 404, description: 'Inscrição não encontrada' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async create(@Req() req, @Body() createExamDto: CreateExamDto) {
    const userId = req.user.userId;
    return await this.examsService.create(userId, createExamDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os exames do usuário autenticado' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de exames do usuário',
    type: [ExamResponseDto]
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async findAllByUser(@Req() req) {
    const userId = req.user.userId;
    return await this.examsService.findAllByUser(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar detalhes de um exame específico' })
  @ApiParam({ name: 'id', description: 'ID do exame' })
  @ApiResponse({ 
    status: 200, 
    description: 'Detalhes do exame',
    type: ExamResponseDto
  })
  @ApiResponse({ status: 404, description: 'Exame não encontrado' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async findOne(@Req() req, @Param('id', ParseUUIDPipe) id: string) {
    const userId = req.user.userId;
    return await this.examsService.findOne(id, userId);
  }

  @Get(':id/questions')
  @ApiOperation({ summary: 'Obter questões para um exame em andamento' })
  @ApiParam({ name: 'id', description: 'ID do exame' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de questões do exame',
    schema: {
      example: {
        examId: 'uuid',
        questions: [
          {
            id: 'uuid',
            question: 'A fotossíntese é o processo de produção de energia das plantas?'
          }
        ],
        totalQuestions: 20
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Exame não está em andamento ou sem questões válidas' })
  @ApiResponse({ status: 404, description: 'Exame não encontrado' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async getQuestions(@Req() req, @Param('id', ParseUUIDPipe) id: string) {
    const userId = req.user.userId;
    return await this.examsService.getExamQuestions(id, userId);
  }

  @Post(':id/submit')
  @ApiOperation({ summary: 'Enviar respostas e finalizar o exame' })
  @ApiParam({ name: 'id', description: 'ID do exame' })
  @ApiBody({ type: SubmitExamDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Exame finalizado e corrigido com sucesso',
    type: ExamResultDto
  })
  @ApiResponse({ status: 400, description: 'Exame não está em andamento ou respostas inválidas' })
  @ApiResponse({ status: 404, description: 'Exame não encontrado' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async submitExam(
    @Req() req,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() submitExamDto: SubmitExamDto
  ) {
    const userId = req.user.userId;
    return await this.examsService.submitExam(id, userId, submitExamDto);
  }

  @Get(':id/result')
  @ApiOperation({ summary: 'Obter resultado de um exame finalizado' })
  @ApiParam({ name: 'id', description: 'ID do exame' })
  @ApiResponse({ 
    status: 200, 
    description: 'Resultado do exame',
    type: ExamResultDto
  })
  @ApiResponse({ status: 400, description: 'Exame ainda não foi corrigido' })
  @ApiResponse({ status: 404, description: 'Exame não encontrado' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async getResult(@Req() req, @Param('id', ParseUUIDPipe) id: string) {
    const userId = req.user.userId;
    return await this.examsService.getExamResult(id, userId);
  }
}
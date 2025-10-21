import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UploadedFile, BadRequestException, UseInterceptors } from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { ApiBody, ApiConsumes, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GenerateQuestionsDto } from './dto/generate-questions.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Multer } from 'multer';

@ApiTags('questions')
@Controller('questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) { }

  @Post()
  @ApiOperation({ summary: 'Create a new question' })
  @ApiBody({ type: CreateQuestionDto })
  @ApiResponse({ status: 201, description: 'Question created successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  create(@Body() createQuestionDto: CreateQuestionDto) {
    return this.questionsService.create(createQuestionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all questions' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Número da página' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Limite por página' })
  @ApiQuery({ name: 'onlyValid', required: false, type: Boolean, description: 'Retornar apenas questões válidas' })
  @ApiResponse({ status: 200, description: 'Lista de questões retornada com sucesso' })
  findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('onlyValid') onlyValid: boolean = false,
  ) {
    return this.questionsService.findAll(Number(page), Number(limit), onlyValid);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a question' })
  @ApiBody({ type: UpdateQuestionDto })
  @ApiResponse({ status: 200, description: 'Question updated successfully' })
  @ApiResponse({ status: 404, description: 'Question not found' })
  update(@Param('id') id: string, @Body() updateQuestionDto: UpdateQuestionDto) {
    return this.questionsService.update(id, updateQuestionDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deactivate a question' })
  @ApiResponse({ status: 200, description: 'Question deleted successfully' })
  @ApiResponse({ status: 404, description: 'Question not found' })
  remove(@Param('id') id: string) {
    return this.questionsService.softRemove(id);
  }

  @Post('generate-from-pdf')
  @UseInterceptors(FileInterceptor('file', {
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB
    },
    fileFilter: (req, file, cb) => {
      if (file.mimetype !== 'application/pdf') {
        return cb(new BadRequestException('Apenas arquivos PDF são permitidos'), false);
      }
      cb(null, true);
    },
  }))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Gerar questões automaticamente a partir de um PDF usando IA' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Arquivo PDF contendo o conteúdo base'
        },
        quantity: {
          type: 'number',
          default: 10,
          description: 'Quantidade de questões a gerar'
        },
        validity_months: {
          type: 'number',
          default: 12,
          description: 'Meses de validade das questões'
        },
        certificationId: {
          type: 'string',
          description: 'UUID da certificação associada às questões'
        }
      }
    }
  })
  @ApiResponse({
    status: 201,
    description: 'Questões geradas com sucesso',
    schema: {
      example: {
        created: 10,
        message: "10 questões geradas com sucesso!",
        questions: [
          {
            id: "uuid",
            question: "A fotossíntese é o processo pelo qual as plantas produzem energia?",
            answer: true,
            validity_months: 12,
            isActive: true,
            createdAt: "2025-10-09T10:00:00Z",
            updatedAt: "2025-10-09T10:00:00Z"
          }
        ]
      }
    }
  })
  @ApiResponse({ status: 400, description: 'PDF inválido ou erro na geração' })
  async generateFromPDF(
    @UploadedFile() file: Multer.File,
    @Body() dto: GenerateQuestionsDto,
  ) {
    return await this.questionsService.generateFromPDF(
      file,
      dto.quantity || 10,
      dto.validity_months || 12,
      dto.certificationId
    );
  }
}


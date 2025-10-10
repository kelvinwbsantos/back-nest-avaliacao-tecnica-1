import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Question } from './entities/question.entity';
import { Repository } from 'typeorm';
import { GeminiService } from './gemini.service';
import type { Multer } from 'multer';

@Injectable()
export class QuestionsService {
  constructor(
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,
    private readonly geminiService: GeminiService,
  ) { }

  async create(createQuestionDto: CreateQuestionDto): Promise<Question> {
    const { question, answer, validity_months } = createQuestionDto;

    const newQuestion = this.questionRepository.create({
      question,
      answer,
      validity_months,
    });

    await this.questionRepository.save(newQuestion);

    return newQuestion;
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    onlyValid: boolean = false,
  ) {
    const skip = (page - 1) * limit;

    const queryBuilder = this.questionRepository
      .createQueryBuilder('question')
      .skip(skip)
      .take(limit)
      .orderBy('question.createdAt', 'DESC');

    if (onlyValid) {
      queryBuilder.andWhere('question.isActive = :isActive', { isActive: true });
    }

    const [questions, total] = await queryBuilder.getManyAndCount();

    let filteredQuestions = questions;
    if (onlyValid) {
      filteredQuestions = questions.filter(q => q.isValid());
    }

    return {
      data: filteredQuestions,
      meta: {
        total: onlyValid ? filteredQuestions.length : total,
        page,
        limit,
        totalPages: Math.ceil((onlyValid ? filteredQuestions.length : total) / limit),
      },
    };
  }

  async update(id: string, updateQuestionDto: UpdateQuestionDto): Promise<Question> {
    const question = await this.findOne(id);

    Object.assign(question, updateQuestionDto);

    return await this.questionRepository.save(question);
  }

  async findOne(id: string): Promise<Question> {
    const question = await this.questionRepository.findOne({
      where: { id },
    });

    if (!question) {
      throw new NotFoundException(`Question with ID ${id} not found`);
    }

    return question;
  }

  async softRemove(id: string): Promise<Question> {
    const question = await this.findOne(id);
    question.isActive = false;
    return await this.questionRepository.save(question);
  }

  async generateFromPDF(
    file: Multer.File,
    quantity: number,
    validity_months: number,
  ): Promise<{
    created: number;
    questions: Question[];
    message: string;
  }> {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo PDF foi enviado');
    }

    if (file.mimetype !== 'application/pdf') {
      throw new BadRequestException('O arquivo deve ser um PDF');
    }

    const generatedQuestions = await this.geminiService.generateQuestionsFromPDF(
      file.buffer,
      quantity
    );

    // Salva as questões geradas no banco de dados
    const questions = generatedQuestions.map(q =>
      this.questionRepository.create({
        question: q.question,
        answer: q.answer,
        validity_months,
        isActive: true,
      })
    );

    const savedQuestions = await this.questionRepository.save(questions);
    //

    return {
      created: savedQuestions.length,
      questions: savedQuestions,
      message: `${savedQuestions.length} questões geradas com sucesso!`
    };
  }
}
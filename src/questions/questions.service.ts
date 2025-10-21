import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Question } from './entities/question.entity';
import { Repository } from 'typeorm';
import { GeminiService } from './gemini.service';
import type { Multer } from 'multer';
import { Certification } from 'src/certifications/entities/certification.entity';
import * as fs from 'fs/promises';

@Injectable()
export class QuestionsService {
  constructor(
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,
    @InjectRepository(Certification)
    private readonly certificationRepository: Repository<Certification>,
    private readonly geminiService: GeminiService,
  ) { }

  async create(createQuestionDto: CreateQuestionDto): Promise<Question> {
    const { question, answer, validity_months, certificationId } = createQuestionDto;

    const certification = await this.certificationRepository.findOneBy({ id: certificationId });
    if (!certification) {
      throw new NotFoundException(`Certification with ID ${certificationId} not found`);
    }

    const newQuestion = this.questionRepository.create({
      question,
      answer,
      validity_months,
      certificationId,
    });

    await this.questionRepository.save(newQuestion);

    return newQuestion;
  }

  //
  async findByCertification(certificationId: string): Promise<Question[]> {
    const questions = await this.questionRepository.find({
      where: { certificationId, isActive: true },
      order: { createdAt: 'DESC' },
    });

    return questions.filter(q => q.isValid());
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
    certificationId: string,
  ): Promise<{
    created: number;
    questions: Question[];
    message: string;
  }> {
    const pdfBuffer = await this.getPdfBuffer(file, certificationId);

    const generatedQuestions = await this.geminiService.generateQuestionsFromPDF(
      pdfBuffer,
      quantity
    );

    const questions = generatedQuestions.map(q =>
      this.questionRepository.create({
        question: q.question,
        answer: q.answer,
        validity_months,
        isActive: true,
        certificationId,
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

  private async getPdfBuffer(file: Multer.File, certificationId: string): Promise<Buffer> {
    if (file) {
      if (file.mimetype !== 'application/pdf') {
        throw new BadRequestException('O arquivo enviado deve ser um PDF.');
      }
      return file.buffer;
    }

    if (!certificationId) {
      throw new BadRequestException('Nenhum arquivo PDF foi enviado e nenhum ID de certificação foi fornecido.');
    }

    const certification = await this.certificationRepository.findOne({
      where: { id: certificationId },
    });

    if (!certification || !certification.pdfPath) {
      throw new NotFoundException(`Nenhum PDF armazenado encontrado para a certificação com ID: ${certificationId}`);
    }

    const filePath = certification.pdfPath;

    try {
      const pdfBuffer = await fs.readFile(filePath);
      return pdfBuffer;
    } catch (error) {
      throw new NotFoundException(`Erro ao ler o arquivo PDF armazenado para a certificação com ID: ${certificationId}`);
    }
  }
}
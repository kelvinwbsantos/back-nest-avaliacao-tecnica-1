import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Exam, ExamStatus } from './entities/exam.entity';
import { ExamAnswer } from './entities/exam-answer.entity';
import { CreateExamDto } from './dto/create-exam.dto';
import { SubmitExamDto } from './dto/submit-answer.dto';
import { EnrollmentsService } from 'src/enrollments/enrollments.service';
import { QuestionsService } from 'src/questions/questions.service';
import { CertificationsService } from 'src/certifications/certifications.service';
import { ExamResultDto } from './dto/exam-response.dto';
import { EnrollmentStatus } from 'src/enrollments/entities/enrollment.entity';
import { CertificatesService } from 'src/certificates/certificates.service';
import { CreateCertificateDto } from 'src/certificates/dto/create-certificate.dto';

@Injectable()
export class ExamsService {
  constructor(
    @InjectRepository(Exam)
    private readonly examRepository: Repository<Exam>,
    @InjectRepository(ExamAnswer)
    private readonly examAnswerRepository: Repository<ExamAnswer>,
    private readonly enrollmentsService: EnrollmentsService,
    private readonly questionsService: QuestionsService,
    private readonly certificationsService: CertificationsService,
    private readonly certificateService: CertificatesService,
  ) { }

  async create(userId: string, createExamDto: CreateExamDto): Promise<Exam> {
    const { enrollmentId } = createExamDto;

    const enrollments = await this.enrollmentsService.findAllByUser(userId);
    const enrollment = enrollments.find(e => e.id === enrollmentId);

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found or does not belong to the user');
    }

    if (enrollment.status !== EnrollmentStatus.ACTIVE) {
      throw new BadRequestException('Cannot start exam for inactive enrollment');
    }

    const existingExam = await this.examRepository.findOne({
      where: {
        userId,
        enrollmentId,
        certificationId: enrollment.certificationId,
        status: ExamStatus.IN_PROGRESS
      }
    });

    if (existingExam) {
      throw new BadRequestException('There is already an exam in progress for this enrollment');
    }

    const exam = this.examRepository.create({
      userId,
      enrollmentId,
      certificationId: enrollment.certificationId,
      status: ExamStatus.IN_PROGRESS,
      startedAt: new Date(),
    });

    return await this.examRepository.save(exam);
  }

async findOne(examId: string, userId: string): Promise<Exam> {
    const exam = await this.examRepository
      .createQueryBuilder('exam')
      .leftJoinAndSelect('exam.answers', 'answers')
      .leftJoinAndSelect('answers.question', 'question')
      .leftJoinAndSelect('exam.certification', 'certification')
      .where('exam.id = :examId', { examId })
      .andWhere('exam.userId = :userId', { userId })
      .getOne();
    
    if (!exam) {
      throw new NotFoundException('Exam not found or does not belong to the user');
    }

    return exam;
}

  async findAllByUser(userId: string): Promise<Exam[]> {
    const queryBuilder = this.examRepository
      .createQueryBuilder('exam')
      .where('exam.userId = :userId', { userId })
      .leftJoin('exam.certification', 'certification')
      .addSelect('certification.name');

      const [exams, total] = await queryBuilder.getManyAndCount();

      return exams;
  }

  async getExamQuestions(examId: string, userId: string) {
    const exam = await this.findOne(examId, userId);

    if (exam.status !== ExamStatus.IN_PROGRESS) {
      throw new BadRequestException('This exam is not in progress');
    }

    const questions = await this.questionsService.findByCertification(exam.certificationId);

    if (questions.length === 0) {
      throw new BadRequestException('No valid questions found for this certification');
    }

    if (questions.length < 10) {
      throw new BadRequestException('Not enough questions available for this certification');
    }

    const shuffledQuestions = questions
      .sort(() => Math.random() - 0.5)
      .slice(0, 10) // Limitar a 10 questões, futuramente tornar isso definido pela certificação
      .map(q => ({
        id: q.id,
        question: q.question,
      }));

    return {
      examId: exam.id,
      questions: shuffledQuestions,
      totalQuestions: shuffledQuestions.length,
    };
  }

  async submitExam(
    examId: string,
    userId: string,
    submitExamDto: SubmitExamDto
  ): Promise<ExamResultDto> {
    const exam = await this.findOne(examId, userId);

    if (exam.status !== ExamStatus.IN_PROGRESS) {
      throw new BadRequestException('This exam is not in progress');
    }

    const { answers } = submitExamDto;

    if (!answers || answers.length === 0) {
      throw new BadRequestException('No answers provided');
    }

    const questions = await this.questionsService.findByCertification(exam.certificationId);
    const questionMap = new Map(questions.map(q => [q.id, q]));

    const validatedAnswers: Array<{
      questionId: string;
      userAnswer: boolean;
      isCorrect: boolean;
    }> = [];
    let correctCount = 0;

    for (const answer of answers) {
      const question = questionMap.get(answer.questionId);

      if (!question) {
        throw new BadRequestException(`Question ${answer.questionId} not found or invalid`);
      }

      const isCorrect = question.answer === answer.userAnswer;
      if (isCorrect) correctCount++;

      validatedAnswers.push({
        questionId: answer.questionId,
        userAnswer: answer.userAnswer,
        isCorrect,
      });
    }

    const examAnswers = validatedAnswers.map(answer =>
      this.examAnswerRepository.create({
        examId: examId,
        questionId: answer.questionId,
        userAnswer: answer.userAnswer,
        isCorrect: answer.isCorrect,
      })
    );

    const savedExamAnswers = await this.examAnswerRepository.save(examAnswers);

    exam.answers = savedExamAnswers;

    const totalQuestions = answers.length;
    const score = (correctCount / totalQuestions) * 100;

    const certification = await this.certificationsService.findOne(exam.certificationId);
    const passed = score >= certification.passingScore;

    exam.status = ExamStatus.GRADED;
    exam.score = parseFloat(score.toFixed(2));
    exam.passed = passed;
    exam.completedAt = new Date();

    await this.examRepository.save(exam);

    const enrollments = await this.enrollmentsService.findAllByUser(userId);
    const enrollment = enrollments.find(e => e.id === exam.enrollmentId);

    if (enrollment) {
      enrollment.status = passed ? EnrollmentStatus.APPROVED : EnrollmentStatus.REPROVED;
      await this.enrollmentsService['enrollmentRepository'].save(enrollment);
    }

    if (exam.passed) {
      const createCertificateDto: CreateCertificateDto = {
        userId: userId,
        certificationId: exam.certificationId,
      };

      await this.certificateService.create(createCertificateDto);
      console.log("Certificado gerado com sucesso");
    }

    return {
      id: exam.id,
      score: exam.score,
      passed: exam.passed,
      correctAnswers: correctCount,
      totalQuestions,
      passingScore: certification.passingScore,
      completedAt: exam.completedAt,
      certificationName: certification.name,
    };
  }

  async getExamResult(examId: string, userId: string): Promise<ExamResultDto> {
    const exam = await this.examRepository.findOne({
      where: { id: examId, userId },
      relations: ['answers'],
    });

    if (!exam) {
      throw new NotFoundException('Exam not found');
    }

    if (exam.status !== ExamStatus.GRADED) {
      throw new BadRequestException('Exam has not been graded yet');
    }

    const certification = await this.certificationsService.findOne(exam.certificationId);
    const correctAnswers = exam.answers.filter(a => a.isCorrect).length;

    return {
      id: exam.id,
      score: exam.score,
      passed: exam.passed,
      correctAnswers,
      totalQuestions: exam.answers.length,
      passingScore: certification.passingScore,
      completedAt: exam.completedAt,
      certificationName: certification.name,
    };
  }
}
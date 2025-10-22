import { Module } from '@nestjs/common';
import { ExamsService } from './exams.service';
import { ExamsController } from './exams.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Exam } from './entities/exam.entity';
import { ExamAnswer } from './entities/exam-answer.entity';
import { EnrollmentsModule } from 'src/enrollments/enrollments.module';
import { QuestionsModule } from 'src/questions/questions.module';
import { CertificationsModule } from 'src/certifications/certifications.module';
import { CertificatesModule } from 'src/certificates/certificates.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Exam, ExamAnswer]),
    EnrollmentsModule,
    QuestionsModule,
    CertificationsModule,
    CertificatesModule
  ],
  controllers: [ExamsController],
  providers: [ExamsService],
  exports: [ExamsService]
})
export class ExamsModule {}
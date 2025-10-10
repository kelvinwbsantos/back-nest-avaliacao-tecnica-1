import { Module } from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { QuestionsController } from './questions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Question } from './entities/question.entity';
import { GeminiService } from './gemini.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Question])
  ],
  controllers: [QuestionsController],
  providers: [QuestionsService, GeminiService],
})
export class QuestionsModule {}

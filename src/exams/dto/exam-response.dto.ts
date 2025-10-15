import { ApiProperty } from "@nestjs/swagger";
import { ExamStatus } from "../entities/exam.entity";

export class ExamQuestionDto {
    @ApiProperty({ example: 'uuid' })
    id: string;

    @ApiProperty({ example: 'A fotossíntese é o processo de produção de energia das plantas?' })
    question: string;
}

export class ExamResponseDto {
    @ApiProperty({ example: 'uuid' })
    id: string;

    @ApiProperty({ example: 'uuid' })
    enrollmentId: string;

    @ApiProperty({ example: 'uuid' })
    certificationId: string;

    @ApiProperty({ enum: ExamStatus })
    status: ExamStatus;

    @ApiProperty({ example: 85.5, required: false })
    score?: number;

    @ApiProperty({ example: true, required: false })
    passed?: boolean;

    @ApiProperty({ type: [ExamQuestionDto] })
    questions: ExamQuestionDto[];

    @ApiProperty()
    startedAt: Date;

    @ApiProperty({ required: false })
    completedAt?: Date;

    @ApiProperty()
    createdAt: Date;
}

export class ExamResultDto {
    @ApiProperty({ example: 'uuid' })
    id: string;

    @ApiProperty({ example: 85.5 })
    score: number;

    @ApiProperty({ example: true })
    passed: boolean;

    @ApiProperty({ example: 17 })
    correctAnswers: number;

    @ApiProperty({ example: 20 })
    totalQuestions: number;

    @ApiProperty({ example: 70 })
    passingScore: number;

    @ApiProperty()
    completedAt: Date;

    @ApiProperty({ example: 'Certificação de Segurança da Informação' })
    certificationName: string;
}
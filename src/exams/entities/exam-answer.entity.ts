import { Question } from "src/questions/entities/question.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Exam } from "./exam.entity";

@Entity('exam_answers')
export class ExamAnswer {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    examId: string;

    @Column()
    questionId: string;

    @Column()
    userAnswer: boolean;

    @Column({ nullable: true })
    isCorrect: boolean;

    @CreateDateColumn()
    answeredAt: Date;

    @ManyToOne(() => Exam, exam => exam.answers)
    @JoinColumn({ name: 'examId' })
    exam: Exam;

    @ManyToOne(() => Question)
    @JoinColumn({ name: 'questionId' })
    question: Question;
}
import { User } from "src/users/entities/user.entity";
import { Enrollment } from "src/enrollments/entities/enrollment.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { ExamAnswer } from "./exam-answer.entity";
import { Certification } from "src/certifications/entities/certification.entity";

export enum ExamStatus {
    IN_PROGRESS = 'in_progress',
    GRADED = 'graded'
}

@Entity('exams')
export class Exam {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    userId: string;

    @Column()
    enrollmentId: string;

    @Column({ nullable: true })
    certificationId: string;

    @Column({
        type: 'enum',
        enum: ExamStatus,
        default: ExamStatus.IN_PROGRESS
    })
    status: ExamStatus;

    @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
    score: number;

    @Column({ type: 'boolean', nullable: true })
    passed: boolean;

    @Column({ type: 'timestamp', nullable: true })
    startedAt: Date;

    @Column({ type: 'timestamp', nullable: true })
    completedAt: Date;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'userId' })
    user: User;

    @ManyToOne(() => Enrollment)
    @JoinColumn({ name: 'enrollmentId' })
    enrollment: Enrollment;

    @ManyToOne(() => Certification)
    @JoinColumn({ name: 'certificationId' })
    certification: Certification;

    @OneToMany(() => ExamAnswer, answer => answer.exam, { cascade: true })
    answers: ExamAnswer[];
}
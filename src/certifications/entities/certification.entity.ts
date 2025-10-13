import { Enrollment } from "src/enrollments/entities/enrollment.entity";
import { Question } from "src/questions/entities/question.entity";
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Certification {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ length: 255, nullable: false })
    name: string;

    @Column({ length: 255, nullable: false })
    shortDescription: string;

    @Column({ length: 511, nullable: false })
    description: string;

    @Column({ nullable: false, default: 70 })
    passingScore: number;

    @Column({ nullable: false, default: 'online' })
    modality: string;

    @Column({ nullable: false, default: 2 })
    durationHours: number;

    @Column({ nullable: false, default: true })
    isActive: boolean;

    @OneToMany(() => Question, question => question.certification)
    questions: Question[];

    @OneToMany(() => Enrollment, enrollment => enrollment.certification)
    enrollments: Enrollment[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
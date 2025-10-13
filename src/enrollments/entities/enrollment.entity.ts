import { Certification } from "src/certifications/entities/certification.entity";
import { User } from "src/users/entities/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from "typeorm";

export enum EnrollmentStatus {
    ACTIVE = 'active',
    APROVED = 'approved',
    REPROVED = 'reproved'
}

@Unique(['userId', 'certificationId'])
@Entity('enrollments')
export class Enrollment {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    userId: string;

    @Column()
    certificationId: string;

    @Column({
        type: 'enum',
        enum: EnrollmentStatus,
        default: EnrollmentStatus.ACTIVE
    })
    status: EnrollmentStatus;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToOne(() => User, (user) => user.enrollments)
    @JoinColumn({ name: 'userId' })
    user: User;

    @ManyToOne(() => Certification, (certification) => certification.enrollments)
    @JoinColumn({ name: 'certificationId' })
    certification: Certification;
}

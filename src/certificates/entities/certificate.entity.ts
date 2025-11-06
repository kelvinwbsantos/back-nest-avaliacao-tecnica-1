import { Certification } from "src/certifications/entities/certification.entity";
import { User } from "src/users/entities/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Certificate {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    userId: string;

    @Column()
    certificationId: string;

    @Column({ nullable: true })
    expiresAt: Date;

    @CreateDateColumn()
    createdAt: Date;

    @OneToOne(() => User)
    @JoinColumn({ name: "userId"})
    user: User;

    @OneToOne(() => Certification)
    @JoinColumn({ name: "certificationId"})
    certification: Certification;
}

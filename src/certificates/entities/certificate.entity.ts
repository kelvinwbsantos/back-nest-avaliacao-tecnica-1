import { Certification } from "src/certifications/entities/certification.entity";
import { User } from "src/users/entities/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Certificate {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    userId: string;

    @Column({ nullable: true })
    snapshot_student_name: string;

    @Column()
    certificationId: string;

    @Column({ nullable: true })
    snapshot_certification_name: string;

    @Column({ nullable: true })
    expiresAt: Date;

    @CreateDateColumn()
    createdAt: Date;

    @Column({ nullable: true })
    blockchainTxHash: string;

    @Column({ nullable: true })
    blockchain_nft_id: string;

    @Column({ nullable: true, default: false })
    blockchain_minted: boolean;

    @ManyToOne(() => User)
    @JoinColumn({ name: "userId"})
    user: User;

    @ManyToOne(() => Certification)
    @JoinColumn({ name: "certificationId"})
    certification: Certification;
}

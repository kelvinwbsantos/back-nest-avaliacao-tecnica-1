import { Certification } from "src/certifications/entities/certification.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Question {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ type: "text", nullable: false })
    question: string;

    @Column({ nullable: false })
    answer: boolean;

    @Column({ nullable: false })
    validity_months: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column({ nullable: false , default: true})
    isActive: boolean;

    @Column()
    certificationId: string;

    @ManyToOne(() => Certification, (certification) => certification.questions)
    @JoinColumn({ name: "certificationId" })
    certification: Certification;

    isValid(): boolean {
        if (!this.isActive) {
            return false;
        }

        const now = new Date();
        const expirationDate = new Date(this.createdAt);
        expirationDate.setMonth(expirationDate.getMonth() + this.validity_months);
        
        return now <= expirationDate;
    }
}
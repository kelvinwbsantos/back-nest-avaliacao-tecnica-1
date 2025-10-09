import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Question {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ length: 255, nullable: false })
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
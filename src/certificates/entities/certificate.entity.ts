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

    @Column({ nullable: false, default: true })
    active: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @OneToOne(() => User)
    @JoinColumn({ name: "userId"})
    user: User;

    @OneToOne(() => Certification)
    @JoinColumn({ name: "certificationId"})
    certification: Certification;

    isValid(): boolean {
        const VALIDADE_CERTIFICACAO = 6;
        const now = new Date();
        const expirationDate = new Date(this.createdAt);
        expirationDate.setMonth(expirationDate.getMonth() + VALIDADE_CERTIFICACAO)

        const isValid = now <= expirationDate && this.active;

        if (!isValid) {
            this.active = false;
        }

        return isValid;
    }
}

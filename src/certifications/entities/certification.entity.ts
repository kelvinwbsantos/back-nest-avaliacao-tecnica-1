import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

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

    @Column({ nullable: false , default: true})
    isActive: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
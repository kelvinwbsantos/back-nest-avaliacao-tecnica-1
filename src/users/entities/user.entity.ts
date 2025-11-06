import { Enrollment } from 'src/enrollments/entities/enrollment.entity';
import { Role } from 'src/roles/entities/role.entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, JoinColumn, OneToMany } from 'typeorm';

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 100, nullable: false })
    name: string;

    @Column({ length: 100, nullable: false })
    email: string;

    // alterar para 11, guardar sem mascara
    @Index()
    @Column({ length: 14, unique: true, nullable: false })
    cpf: string;

    @Column({ length: 11, nullable: true })
    phonenumber: string;

    @Column({ length: 8, nullable: true })
    cep: string;

    @Column({ length: 2, nullable: true })
    uf: string;

    @Column({ length: 30, nullable: true })
    city: string;

    @Column({ length: 40, nullable: true })
    neighborhood: string;

    @Column({ length: 100, nullable: true })
    street: string;

    @Column({ length: 100, nullable: false })
    password: string;

    @ManyToOne(() => Role, role => role.users)
    @JoinColumn({ name: 'role_id' })
    role: Role;

    @OneToMany(() => Enrollment, (enrollment) => enrollment.user)
    enrollments: Enrollment[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}

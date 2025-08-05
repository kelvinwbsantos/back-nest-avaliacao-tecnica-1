import { Role } from 'src/roles/entities/role.entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 100, nullable: false})
    name: string;

    @Column({ length: 100, nullable: false})
    email: string;

    // alterar para 11, guardar sem mascara
    @Index()
    @Column({ length: 14, unique: true, nullable: false })
    cpf: string;

    @Column({ length: 11 })
    phonenumber: string;

    @Column({ length: 8 })
    cep: string;

    @Column({ length: 2 })
    uf: string;

    @Column({ length: 30 })
    city: string;

    @Column({ length: 40 })
    neighborhood: string;

    @Column({ length: 100 })
    street: string;

    @Column({ length: 100, nullable: false })
    password: string;

    @ManyToOne(() => Role, role => role.users)
    @JoinColumn({ name: 'role_id' })
    role: Role;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}

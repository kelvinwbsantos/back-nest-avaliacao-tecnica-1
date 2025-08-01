import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum InviteStatus {
  PENDING = 'Em Aberto',
  COMPLETED = 'Finalizado',
  EXPIRED = 'Vencido',
}

@Entity('invites')
export class Invite {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  sender: string;

  @Column({ unique: true })
  token: string;

  @Column({ type: 'enum', enum: InviteStatus, default: InviteStatus.PENDING })
  status: InviteStatus;

  @CreateDateColumn()
  createdAt: Date;

  @Column()
  expiresAt: Date;
}
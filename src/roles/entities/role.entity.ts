import { User } from 'src/users/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

/**
 * Representa uma 'role' de usuário no sistema.
 * Ex: "administrador", "gente_e_cultura", "colaborador", etc.
 */

@Entity('roles')
export class Role {
  /**
   * ID único da 'role'.
   */
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * Nome do papel (normalizado e único).
   * Ex: "administrador", "gente_e_cultura", "colaborador", etc.
   */
  @Column({ unique: true })
  name: string;

  /**
   * Lista de usuários que pertencem a esta 'role'.
   */
  @OneToMany(() => User, user => user.role)
  users: User[];
}
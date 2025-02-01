import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class UsersEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;
}

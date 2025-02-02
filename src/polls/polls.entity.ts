import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { UsersEntity } from '../users/users.entity';

@Entity('polls')
export class PollsEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @ManyToOne(() => UsersEntity, user => user.polls, { onDelete: 'CASCADE' })
  author: UsersEntity;
}

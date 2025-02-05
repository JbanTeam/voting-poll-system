import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { UsersEntity } from '../users/users.entity';
import { QuestionsEntity } from '../questions/questions.entity';

export enum PollStatus {
  ACTIVE = 'ACTIVE',
  CLOSED = 'CLOSED',
}

@Entity('polls')
export class PollsEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  closedAt: Date;

  @Column({ type: 'enum', enum: PollStatus, default: PollStatus.ACTIVE })
  status: PollStatus;

  @ManyToOne(() => UsersEntity, user => user.polls, { onDelete: 'CASCADE' })
  @JoinColumn()
  author: UsersEntity;

  @OneToMany(() => QuestionsEntity, question => question.poll, { cascade: true })
  questions: QuestionsEntity[];
}

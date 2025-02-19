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

import { UserEntity } from '@modules/user/user.entity';
import { QuestionEntity } from '@modules/question/question.entity';

export enum PollStatus {
  ACTIVE = 'ACTIVE',
  CLOSED = 'CLOSED',
}

@Entity('poll')
export class PollEntity {
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

  @ManyToOne(() => UserEntity, user => user.polls, { onDelete: 'CASCADE' })
  @JoinColumn()
  author: UserEntity;

  @OneToMany(() => QuestionEntity, question => question.poll, { cascade: true })
  questions: QuestionEntity[];
}

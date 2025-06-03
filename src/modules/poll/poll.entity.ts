import { ApiProperty } from '@nestjs/swagger';
import { Entity, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn, OneToMany } from 'typeorm';

import { UserEntity } from '@modules/user/user.entity';
import { BaseEntity } from '@common/entities/base.entity';
import { QuestionEntity } from '@modules/question/question.entity';

export enum PollStatus {
  ACTIVE = 'ACTIVE',
  CLOSED = 'CLOSED',
}

@Entity('poll')
export class PollEntity extends BaseEntity {
  @ApiProperty({ example: 'Super poll' })
  @Column()
  title: string;

  @ApiProperty({ example: 'Super description' })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty({ example: '2025-02-24T15:43:31.838Z' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ example: '2025-02-24T15:43:31.838Z' })
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiProperty({ example: null, nullable: true, default: null })
  @Column({ type: 'timestamp', nullable: true })
  closedAt: Date;

  @ApiProperty({ enum: Object.values(PollStatus), example: PollStatus.ACTIVE, default: PollStatus.ACTIVE })
  @Column({ type: 'enum', enum: PollStatus, default: PollStatus.ACTIVE })
  status: PollStatus;

  @ApiProperty({ type: () => UserEntity })
  @ManyToOne(() => UserEntity, user => user.polls, { onDelete: 'CASCADE' })
  @JoinColumn()
  author: UserEntity;

  @ApiProperty({ type: () => [QuestionEntity] })
  @OneToMany(() => QuestionEntity, question => question.poll, { cascade: true })
  questions: QuestionEntity[];
}

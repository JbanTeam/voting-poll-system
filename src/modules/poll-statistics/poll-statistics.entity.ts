import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { AnswerEntity } from '@modules/answer/answer.entity';
import { PollEntity } from '@modules/poll/poll.entity';
import { QuestionEntity } from '@modules/question/question.entity';

@Entity('poll_statistics')
export class PollStatisticsEntity {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ type: () => PollEntity })
  @ManyToOne(() => PollEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'poll_id' })
  poll: PollEntity;

  @ApiProperty({ type: () => AnswerEntity })
  @ManyToOne(() => AnswerEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'answer_id' })
  answer: AnswerEntity;

  @ApiProperty({ type: () => QuestionEntity })
  @ManyToOne(() => QuestionEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'question_id' })
  question: QuestionEntity;

  @ApiProperty({ example: 0 })
  @Column({ type: 'int', default: 0 })
  count: number;
}

import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { AnswerEntity } from '../answer/answer.entity';
import { PollEntity } from '../poll/poll.entity';
import { QuestionEntity } from '../question/question.entity';

@Entity('poll_statistics')
export class PollStatisticsEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => PollEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'poll_id' })
  poll: PollEntity;

  @ManyToOne(() => AnswerEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'answer_id' })
  answer: AnswerEntity;

  @ManyToOne(() => QuestionEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'question_id' })
  question: QuestionEntity;

  @Column({ type: 'int', default: 0 })
  count: number;
}

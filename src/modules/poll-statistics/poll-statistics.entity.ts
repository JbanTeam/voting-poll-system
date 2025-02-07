import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { AnswersEntity } from '../answers/answers.entity';
import { PollsEntity } from '../polls/polls.entity';
import { QuestionsEntity } from '../questions/questions.entity';

@Entity('poll_statistics')
export class PollStatisticsEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => PollsEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'poll_id' })
  poll: PollsEntity;

  @ManyToOne(() => AnswersEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'answer_id' })
  answer: AnswersEntity;

  @ManyToOne(() => QuestionsEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'question_id' })
  question: QuestionsEntity;

  @Column({ type: 'int', default: 0 })
  count: number;
}

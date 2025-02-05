import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { AnswersEntity } from '../answers/answers.entity';
import { PollsEntity } from '../polls/polls.entity';

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

  @Column({ type: 'int', default: 0 })
  count: number;
}

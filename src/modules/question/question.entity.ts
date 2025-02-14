import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { PollEntity } from '../poll/poll.entity';
import { AnswerEntity } from '../answer/answer.entity';

@Entity('question')
export class QuestionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  text: string;

  @ManyToOne(() => PollEntity, poll => poll.questions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'poll_id' })
  poll: PollEntity;

  @OneToMany(() => AnswerEntity, answer => answer.question, { cascade: true })
  answers: AnswerEntity[];
}

import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { PollsEntity } from '../polls/polls.entity';
import { AnswersEntity } from '../answers/answers.entity';

@Entity('questions')
export class QuestionsEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  text: string;

  @ManyToOne(() => PollsEntity, poll => poll.questions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'poll_id' })
  poll: PollsEntity;

  @OneToMany(() => AnswersEntity, answer => answer.question, { cascade: true })
  answers: AnswersEntity[];
}

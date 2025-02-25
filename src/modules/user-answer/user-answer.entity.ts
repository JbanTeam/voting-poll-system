import { ApiProperty } from '@nestjs/swagger';
import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { UserEntity } from '@modules/user/user.entity';
import { QuestionEntity } from '@modules/question/question.entity';
import { AnswerEntity } from '@modules/answer/answer.entity';
import { PollEntity } from '@modules/poll/poll.entity';

@Entity('user_answer')
export class UserAnswerEntity {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ type: () => UserEntity })
  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @ApiProperty({ type: () => PollEntity })
  @ManyToOne(() => PollEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'poll_id' })
  poll: PollEntity;

  @ApiProperty({ type: () => QuestionEntity })
  @ManyToOne(() => QuestionEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'question_id' })
  question: QuestionEntity;

  @ApiProperty({ type: () => AnswerEntity })
  @ManyToOne(() => AnswerEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'answer_id' })
  answer: AnswerEntity;
}

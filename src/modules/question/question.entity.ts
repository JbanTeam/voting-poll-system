import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';

import { PollEntity } from '@modules/poll/poll.entity';
import { AnswerEntity } from '@modules/answer/answer.entity';
import { BaseEntity } from '@common/entities/base.entity';

@Entity('question')
export class QuestionEntity extends BaseEntity {
  @ApiProperty({ example: 'Question 1' })
  @Column()
  text: string;

  @ApiProperty({ type: () => PollEntity })
  @ManyToOne(() => PollEntity, poll => poll.questions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'poll_id' })
  poll: PollEntity;

  @ApiProperty({ type: () => [AnswerEntity] })
  @OneToMany(() => AnswerEntity, answer => answer.question, { cascade: true })
  answers: AnswerEntity[];
}

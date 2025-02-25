import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { QuestionEntity } from '@modules/question/question.entity';

@Entity('answer')
export class AnswerEntity {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'Answer 1' })
  @Column()
  text: string;

  @ApiProperty({ type: () => QuestionEntity, example: { id: 1 } })
  @ManyToOne(() => QuestionEntity, question => question.answers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'question_id' })
  question: QuestionEntity;
}

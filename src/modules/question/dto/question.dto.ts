import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsNotEmpty, IsString, ValidateNested } from 'class-validator';

import { AnswerDto } from '@modules/answer/dto/answer.dto';

export class QuestionDto {
  @ApiProperty({ example: 'Question 1' })
  @IsString({ message: 'Question must be a string' })
  @IsNotEmpty({ message: 'Question is required' })
  text: string;

  @ApiProperty({ example: [{ text: 'Answer 1' }, { text: 'Answer 2' }] })
  @ArrayNotEmpty({ message: 'Answers must be array and not be empty' })
  @ValidateNested({ each: true })
  @Type(() => AnswerDto)
  answers: AnswerDto[];
}

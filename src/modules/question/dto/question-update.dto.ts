import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';

import { AnswerUpdateDto } from '@modules/answer/dto/answer-update.dto';

export class QuestionUpdateDto {
  @IsNumber({}, { message: 'Question id must be a number' })
  @IsOptional()
  id?: number;

  @IsString({ message: 'Question must be a string' })
  @IsOptional()
  text?: string;

  @IsArray({ message: 'Answers must be an array' })
  @ValidateNested({ each: true })
  @Type(() => AnswerUpdateDto)
  @IsOptional()
  answers?: AnswerUpdateDto[];
}

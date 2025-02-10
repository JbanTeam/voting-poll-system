import { Type } from 'class-transformer';
import { IsArray, IsString, ValidateNested } from 'class-validator';
import { AnswerDto } from 'src/modules/answer/dto/answer.dto';

export class QuestionDto {
  @IsString({ message: 'Question must be a string' })
  text: string;

  @IsArray({ message: 'Answers must be an array' })
  @ValidateNested({ each: true })
  @Type(() => AnswerDto)
  answers: AnswerDto[];
}

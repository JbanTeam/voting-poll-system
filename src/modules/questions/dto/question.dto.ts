import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsString, ValidateNested } from 'class-validator';
import { AnswerDto } from 'src/modules/answers/dto/answer.dot';

export class QuestionDto {
  @IsString({ message: 'Question must be a string' })
  text: string;

  @ArrayNotEmpty({ message: 'Answers must be array and not be empty' })
  @ValidateNested({ each: true })
  @Type(() => AnswerDto)
  answers: AnswerDto[];
}

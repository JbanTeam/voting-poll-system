import { Type } from 'class-transformer';
import { IsString, ValidateNested, IsArray } from 'class-validator';
import { QuestionDto } from 'src/modules/question/dto/question.dto';

export class PollUpdateDto {
  @IsString({ message: 'Name must be a string' })
  title: string;

  @IsString({ message: 'Description must be a string' })
  description: string;

  @IsArray({ message: 'Questions must be an array' })
  @ValidateNested({ each: true })
  @Type(() => QuestionDto)
  questions: QuestionDto[];
}

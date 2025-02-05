import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, ArrayNotEmpty, ValidateNested } from 'class-validator';
import { QuestionDto } from 'src/modules/questions/dto/question.dto';
// import { MatchLength } from 'src/utils/match-length.validator';

export class PollsDto {
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required' })
  title: string;

  @IsString({ message: 'Description must be a string' })
  @IsNotEmpty({ message: 'Description is required' })
  description: string;

  @ArrayNotEmpty({ message: 'Questions must be array and not be empty' })
  @ValidateNested({ each: true })
  @Type(() => QuestionDto)
  questions: QuestionDto[];
}

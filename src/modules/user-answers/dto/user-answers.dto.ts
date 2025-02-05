import { Type } from 'class-transformer';
import { IsNotEmpty, ArrayNotEmpty, ValidateNested, IsNumber } from 'class-validator';

export class UserAnswersDto {
  @ArrayNotEmpty({ message: 'User answers must be array and not be empty' })
  @ValidateNested({ each: true })
  @Type(() => UserAnswerDto)
  userAnswers: UserAnswerDto[];
}

class UserAnswerDto {
  @IsNumber()
  @IsNotEmpty({ message: 'Question id is required' })
  questionId: number;

  @IsNumber()
  @IsNotEmpty({ message: 'Answer id is required' })
  answerId: number;
}

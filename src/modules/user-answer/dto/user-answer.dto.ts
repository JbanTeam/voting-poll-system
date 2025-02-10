import { Type } from 'class-transformer';
import { IsNotEmpty, ArrayNotEmpty, ValidateNested, IsNumber } from 'class-validator';

export class UserAnswerDto {
  @ArrayNotEmpty({ message: 'User answers must be array and not be empty' })
  @ValidateNested({ each: true })
  @Type(() => UserAnswer)
  userAnswers: UserAnswer[];
}

export class UserAnswer {
  @IsNumber()
  @IsNotEmpty({ message: 'Question id is required' })
  questionId: number;

  @IsNumber()
  @IsNotEmpty({ message: 'Answer id is required' })
  answerId: number;
}

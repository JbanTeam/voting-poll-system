import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, ArrayNotEmpty, ValidateNested, IsNumber } from 'class-validator';

export class UserAnswerDto {
  @ApiProperty({ example: [{ questionId: 1, answerId: 1 }] })
  @ArrayNotEmpty({ message: 'User answers must be array and not be empty' })
  @ValidateNested({ each: true })
  @Type(() => UserAnswer)
  userAnswers: UserAnswer[];
}

export class UserAnswer {
  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty({ message: 'Question id is required' })
  questionId: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty({ message: 'Answer id is required' })
  answerId: number;
}

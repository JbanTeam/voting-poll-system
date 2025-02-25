import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, ArrayNotEmpty, ValidateNested } from 'class-validator';

import { QuestionDto } from '@modules/question/dto/question.dto';

export class PollDto {
  @ApiProperty({ example: 'Super poll' })
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required' })
  title: string;

  @ApiProperty({ example: 'Super description' })
  @IsString({ message: 'Description must be a string' })
  @IsNotEmpty({ message: 'Description is required' })
  description: string;

  @ApiProperty({ type: () => [QuestionDto] })
  @ArrayNotEmpty({ message: 'Questions must be array and not be empty' })
  @ValidateNested({ each: true })
  @Type(() => QuestionDto)
  questions: QuestionDto[];
}

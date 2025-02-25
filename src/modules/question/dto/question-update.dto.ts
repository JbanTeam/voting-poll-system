import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';

import { AnswerUpdateDto } from '@modules/answer/dto/answer-update.dto';

export class QuestionUpdateDto {
  @ApiProperty({
    example: 1,
    required: false,
    description: 'If id is not provided, a new question will be created, otherwise it will be updated.',
  })
  @IsNumber({}, { message: 'Question id must be a number' })
  @IsOptional()
  id?: number;

  @ApiProperty({ example: 'Updated question', required: false })
  @IsString({ message: 'Question must be a string' })
  @IsOptional()
  text?: string;

  @ApiProperty({ type: () => [AnswerUpdateDto], required: false })
  @IsArray({ message: 'Answers must be an array' })
  @ValidateNested({ each: true })
  @Type(() => AnswerUpdateDto)
  @IsOptional()
  answers?: AnswerUpdateDto[];
}

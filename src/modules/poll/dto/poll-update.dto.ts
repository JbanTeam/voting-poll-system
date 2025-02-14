import { Type } from 'class-transformer';
import { IsString, ValidateNested, IsArray, IsOptional } from 'class-validator';

import { QuestionUpdateDto } from '@modules/question/dto/question-update.dto';

export class PollUpdateDto {
  @IsString({ message: 'Name must be a string' })
  @IsOptional()
  title?: string;

  @IsString({ message: 'Description must be a string' })
  @IsOptional()
  description?: string;

  @IsArray({ message: 'Questions must be an array' })
  @ValidateNested({ each: true })
  @Type(() => QuestionUpdateDto)
  @IsOptional()
  questions?: QuestionUpdateDto[];
}

import { Type } from 'class-transformer';
import { IsString, ValidateNested, IsArray, IsOptional } from 'class-validator';

import { QuestionUpdateDto } from '@modules/question/dto/question-update.dto';
import { ApiProperty } from '@nestjs/swagger';

export class PollUpdateDto {
  @ApiProperty({ example: 'Updated poll', required: false })
  @IsString({ message: 'Name must be a string' })
  @IsOptional()
  title?: string;

  @ApiProperty({ example: 'Updated poll description', required: false })
  @IsString({ message: 'Description must be a string' })
  @IsOptional()
  description?: string;

  @ApiProperty({ type: () => [QuestionUpdateDto], required: false })
  @IsArray({ message: 'Questions must be an array' })
  @ValidateNested({ each: true })
  @Type(() => QuestionUpdateDto)
  @IsOptional()
  questions?: QuestionUpdateDto[];
}

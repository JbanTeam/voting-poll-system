import { IsNumber, IsOptional, IsString } from 'class-validator';

export class AnswerUpdateDto {
  @IsNumber({}, { message: 'Question id must be a number' })
  @IsOptional()
  id?: number;

  @IsString({ message: 'Answer must be a string' })
  text: string;
}

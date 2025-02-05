import { IsString } from 'class-validator';

export class AnswerDto {
  @IsString({ message: 'Answer must be a string' })
  text: string;
}

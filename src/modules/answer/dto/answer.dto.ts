import { IsNotEmpty, IsString } from 'class-validator';

export class AnswerDto {
  @IsString({ message: 'Answer must be a string' })
  @IsNotEmpty({ message: 'Answer is required' })
  text: string;
}

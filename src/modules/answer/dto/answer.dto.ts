import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AnswerDto {
  @ApiProperty({ example: 'Answer 1' })
  @IsString({ message: 'Answer must be a string' })
  @IsNotEmpty({ message: 'Answer is required' })
  text: string;
}

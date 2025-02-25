import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class AnswerUpdateDto {
  @ApiProperty({
    example: 1,
    required: false,
    description: 'If id is not provided, a new answer will be created, otherwise it will be updated.',
  })
  @IsNumber({}, { message: 'Answer id must be a number' })
  @IsOptional()
  id?: number;

  @ApiProperty({
    example: 'Updated answer',
    required: true,
  })
  @IsString({ message: 'Answer must be a string' })
  text: string;
}

import { IsNotEmpty, IsString, ArrayNotEmpty } from 'class-validator';
import { MatchLength } from 'src/utils/match-length.validator';

export class PollsDto {
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required' })
  title: string;

  @IsString({ message: 'Description must be a string' })
  @IsNotEmpty({ message: 'Description is required' })
  description: string;

  // @IsNotEmpty({ message: 'You must add at least one question' })
  // @IsArray({ message: 'Questions must be an array' })
  @ArrayNotEmpty({ message: 'Questions must be array and not be empty' })
  @IsString({ each: true, message: 'Each question must be a string' })
  questions: string[];

  @ArrayNotEmpty({ message: 'Answers must be array and not be empty' })
  @IsString({ each: true, message: 'Each answer must be a string' })
  @MatchLength('questions', { message: 'Answers must match the number of questions' })
  answers: string[];
}

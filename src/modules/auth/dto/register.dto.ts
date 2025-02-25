import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

import { IsEqual } from '@src/utils/validators/match-fields.validator';

export class RegisterDto {
  @ApiProperty({ example: 'Vital' })
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @ApiProperty({ example: 'vital@mail.ru' })
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @ApiProperty({ description: '8 characters min', example: '11111111' })
  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;

  @ApiProperty({ description: 'must be equal to password', example: '11111111' })
  @IsString()
  @IsNotEmpty({ message: 'Confirm password is required' })
  @IsEqual('password', { message: 'Passwords do not match' })
  confirmPassword: string;
}

import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { IsEqual } from '@src/utils/validators/match-fields.validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;

  @IsString()
  @IsNotEmpty({ message: 'Confirm password is required' })
  @IsEqual('password', { message: 'Passwords do not match' })
  confirmPassword: string;
}

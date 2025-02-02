import { IsEmail, IsNotEmpty, IsString, MinLength, Equals } from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @IsNotEmpty({ message: 'Password is required' })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;

  @IsNotEmpty({ message: 'Confirm password is required' })
  @IsString()
  @Equals('password', { message: 'Passwords do not match' })
  confirmPassword: string;
}

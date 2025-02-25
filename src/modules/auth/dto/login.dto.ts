import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'vital@mail.ru' })
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @ApiProperty({ description: '8 characters min', example: '11111111' })
  @IsNotEmpty({ message: 'Password is required' })
  @IsString()
  password: string;
}

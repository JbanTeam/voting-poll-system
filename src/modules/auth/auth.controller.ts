import { Controller, Post, Body, HttpCode, Patch } from '@nestjs/common';

import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Public } from '@src/utils/decorators/public.decorator';
import { CurrentUser } from '@src/utils/decorators/current-user.decorator';
import { DecodedUser } from '@src/types/types';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @Public()
  async register(@Body() registerDto: RegisterDto): Promise<{ accessToken: string; refreshToken: string }> {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(200)
  @Public()
  async login(@Body() loginDto: LoginDto): Promise<{ accessToken: string; refreshToken: string }> {
    return this.authService.login(loginDto);
  }

  @Patch('logout')
  @HttpCode(200)
  async logout(@CurrentUser() user: DecodedUser): Promise<{ message: string }> {
    return this.authService.logout(user.userId);
  }

  @Post('refresh-token')
  @HttpCode(200)
  @Public()
  async refreshToken(@Body('refreshToken') refreshToken: string) {
    return this.authService.refreshToken(refreshToken);
  }
}

import { ApiTags } from '@nestjs/swagger';
import { Controller, Body } from '@nestjs/common';

import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { DecodedUser, TokensReturnType } from '@src/types/types';
import { Register, Login, Logout, RefreshToken } from '@common/decorators/auth.controller.decorator';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Register()
  async register(@Body() registerDto: RegisterDto): Promise<TokensReturnType> {
    return this.authService.register(registerDto);
  }

  @Login()
  async login(@Body() loginDto: LoginDto): Promise<TokensReturnType> {
    return this.authService.login(loginDto);
  }

  @Logout()
  async logout(@CurrentUser() user: DecodedUser): Promise<{ message: string }> {
    return this.authService.logout(user.userId);
  }

  @RefreshToken()
  async refreshToken(@Body('refreshToken') refreshToken: string): Promise<{ accessToken: string }> {
    return this.authService.refreshToken(refreshToken);
  }
}

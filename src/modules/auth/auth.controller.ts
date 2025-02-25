import { ApiBadRequestResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Controller, Post, Body, HttpCode, Patch } from '@nestjs/common';

import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Public } from '@src/utils/decorators/public.decorator';
import { CurrentUser } from '@src/utils/decorators/current-user.decorator';
import { DecodedUser } from '@src/types/types';
import {
  loginApiResponse,
  loginBadRequestApiResponse,
  logoutApiResponse,
  logoutBadRequestApiResponse,
  refreshTokenApiResponse,
  refreshTokenBadRequestApiResponse,
  registerApiResponse,
  registerBadRequestApiResponse,
} from '@src/utils/swaggerUtils';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: 'User registration' })
  @ApiResponse(registerApiResponse)
  @ApiBadRequestResponse(registerBadRequestApiResponse)
  @Public()
  @Post('register')
  async register(@Body() registerDto: RegisterDto): Promise<{ accessToken: string; refreshToken: string }> {
    return this.authService.register(registerDto);
  }

  @ApiOperation({ summary: 'User log in' })
  @ApiResponse(loginApiResponse)
  @ApiBadRequestResponse(loginBadRequestApiResponse)
  @HttpCode(200)
  @Public()
  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<{ accessToken: string; refreshToken: string }> {
    return this.authService.login(loginDto);
  }

  @ApiOperation({ summary: 'User log out' })
  @ApiResponse(logoutApiResponse)
  @ApiBadRequestResponse(logoutBadRequestApiResponse)
  @HttpCode(200)
  @Patch('logout')
  async logout(@CurrentUser() user: DecodedUser): Promise<{ message: string }> {
    return this.authService.logout(user.userId);
  }

  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse(refreshTokenApiResponse)
  @ApiBadRequestResponse(refreshTokenBadRequestApiResponse)
  @HttpCode(200)
  @Public()
  @Post('refresh-token')
  async refreshToken(@Body('refreshToken') refreshToken: string): Promise<{ accessToken: string }> {
    return this.authService.refreshToken(refreshToken);
  }
}

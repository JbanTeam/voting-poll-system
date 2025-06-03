import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Controller, Post, Body, HttpCode, Patch, HttpStatus } from '@nestjs/common';

import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Public } from '@src/utils/decorators/public.decorator';
import { CurrentUser } from '@src/utils/decorators/current-user.decorator';
import { DecodedUser, TokensReturnType } from '@src/types/types';
import {
  createUnauthorizedApiResponse,
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
  async register(@Body() registerDto: RegisterDto): Promise<TokensReturnType> {
    return this.authService.register(registerDto);
  }

  @ApiOperation({ summary: 'User log in' })
  @ApiResponse(loginApiResponse)
  @ApiBadRequestResponse(loginBadRequestApiResponse)
  @HttpCode(HttpStatus.OK)
  @Public()
  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<TokensReturnType> {
    return this.authService.login(loginDto);
  }

  @ApiOperation({ summary: 'User log out' })
  @ApiResponse(logoutApiResponse)
  @ApiBadRequestResponse(logoutBadRequestApiResponse)
  @ApiUnauthorizedResponse(createUnauthorizedApiResponse('/api/auth/logout'))
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @Patch('logout')
  async logout(@CurrentUser() user: DecodedUser): Promise<{ message: string }> {
    return this.authService.logout(user.userId);
  }

  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse(refreshTokenApiResponse)
  @ApiBadRequestResponse(refreshTokenBadRequestApiResponse)
  @HttpCode(HttpStatus.OK)
  @Public()
  @Post('refresh-token')
  async refreshToken(@Body('refreshToken') refreshToken: string): Promise<{ accessToken: string }> {
    return this.authService.refreshToken(refreshToken);
  }
}

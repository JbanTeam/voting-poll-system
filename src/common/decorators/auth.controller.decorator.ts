import { applyDecorators, HttpCode, HttpStatus, Patch, Post } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { Public } from '@common/decorators/public.decorator';
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

export function Register() {
  return applyDecorators(
    ApiOperation({ summary: 'User registration' }),
    ApiResponse(registerApiResponse),
    ApiBadRequestResponse(registerBadRequestApiResponse),
    Public(),
    Post('register'),
  );
}

export function Login() {
  return applyDecorators(
    ApiOperation({ summary: 'User log in' }),
    ApiResponse(loginApiResponse),
    ApiBadRequestResponse(loginBadRequestApiResponse),
    HttpCode(HttpStatus.OK),
    Public(),
    Post('login'),
  );
}

export function Logout() {
  return applyDecorators(
    ApiOperation({ summary: 'User log out' }),
    ApiResponse(logoutApiResponse),
    ApiBadRequestResponse(logoutBadRequestApiResponse),
    ApiUnauthorizedResponse(createUnauthorizedApiResponse('/api/auth/logout')),
    ApiBearerAuth(),
    HttpCode(HttpStatus.OK),
    Patch('logout'),
  );
}

export function RefreshToken() {
  return applyDecorators(
    ApiOperation({ summary: 'Refresh access token' }),
    ApiResponse(refreshTokenApiResponse),
    ApiBadRequestResponse(refreshTokenBadRequestApiResponse),
    HttpCode(HttpStatus.OK),
    Public(),
    Post('refresh-token'),
  );
}

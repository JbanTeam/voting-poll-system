import { UserEntity } from '@modules/user/user.entity';
import { applyDecorators, Get, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiUnauthorizedResponse, ApiBearerAuth } from '@nestjs/swagger';

import { Public } from '@common/decorators/public.decorator';
import { createUnauthorizedApiResponse } from '@src/utils/swaggerUtils';

export function GetAllUsers() {
  return applyDecorators(
    ApiOperation({ summary: 'Get all users' }),
    ApiResponse({ status: HttpStatus.OK, type: [UserEntity] }),
    Public(),
    Get(),
  );
}

export function GetUser() {
  return applyDecorators(
    ApiOperation({ summary: 'Get user by id' }),
    ApiBearerAuth(),
    ApiResponse({ status: HttpStatus.OK, type: UserEntity }),
    ApiUnauthorizedResponse(createUnauthorizedApiResponse('/api/users/:id')),
    Get(':id'),
  );
}

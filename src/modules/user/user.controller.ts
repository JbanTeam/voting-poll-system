import { Controller, Get, HttpStatus, Param, ParseIntPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';

import { UserService } from './user.service';
import { UserEntity } from './user.entity';
import { Public } from '@src/utils/decorators/public.decorator';
import { createUnauthorizedApiResponse } from '@src/utils/swaggerUtils';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private usersService: UserService) {}

  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: HttpStatus.OK, type: [UserEntity] })
  @Public()
  @Get()
  async getUsers(): Promise<UserEntity[]> {
    return await this.usersService.findAll();
  }

  @ApiOperation({ summary: 'Get user by id' })
  @ApiBearerAuth()
  @ApiResponse({ status: HttpStatus.OK, type: UserEntity })
  @ApiUnauthorizedResponse(createUnauthorizedApiResponse('/api/users/:id'))
  @Get(':id')
  async getUser(@Param('id', ParseIntPipe) id: number): Promise<UserEntity | null> {
    return await this.usersService.findById(id, true);
  }
}

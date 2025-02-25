import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { UserService } from './user.service';
import { UserEntity } from './user.entity';
import { Public } from '@src/utils/decorators/public.decorator';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private usersService: UserService) {}

  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, type: [UserEntity] })
  @Public()
  @Get()
  async getUsers(): Promise<UserEntity[]> {
    return await this.usersService.findAll();
  }

  @ApiOperation({ summary: 'Get user by id' })
  @ApiResponse({ status: 200, type: UserEntity })
  @Get(':id')
  async getUser(@Param('id', ParseIntPipe) id: number): Promise<UserEntity | null> {
    return await this.usersService.findById(id);
  }
}

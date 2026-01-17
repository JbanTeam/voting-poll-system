import { ApiTags } from '@nestjs/swagger';
import { Controller, Param, ParseIntPipe } from '@nestjs/common';

import { UserService } from './user.service';
import { UserEntity } from './user.entity';
import { GetAllUsers, GetUser } from '@common/decorators/user.controller.decorator';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private usersService: UserService) {}

  @GetAllUsers()
  async getUsers(): Promise<UserEntity[]> {
    return await this.usersService.findAll();
  }

  @GetUser()
  async getUser(@Param('id', ParseIntPipe) id: number): Promise<UserEntity | null> {
    return await this.usersService.findById(id, true);
  }
}

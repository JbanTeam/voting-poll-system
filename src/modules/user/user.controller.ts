import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { UserService } from './user.service';
import { UserEntity } from './user.entity';
import { Public } from 'src/utils/decorators/public.decorator';

@Controller('users')
export class UserController {
  constructor(private usersService: UserService) {}

  @Public()
  @Get()
  async getUsers(): Promise<UserEntity[]> {
    return await this.usersService.findAll();
  }

  @Get(':id')
  async getUser(@Param('id', ParseIntPipe) id: number): Promise<UserEntity | null> {
    return await this.usersService.findById(id);
  }
}

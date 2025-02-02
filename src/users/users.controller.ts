import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  async getUsers() {
    return await this.usersService.findAll();
  }

  @Get(':id')
  async getUser(@Param('id', ParseIntPipe) id: number) {
    console.log(id);
    return await this.usersService.findUserById(id);
  }
}

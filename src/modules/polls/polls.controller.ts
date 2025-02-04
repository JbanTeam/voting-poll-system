import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { PollsService } from './polls.service';
import { PollsEntity } from './polls.entity';
import { PollsDto } from './dto/polls.dto';
import { CurrentUser } from 'src/utils/current-user.decorator';
import { DecodedUser, PollsByPage } from 'src/types/types';

@Controller('polls')
export class PollsController {
  constructor(private pollsService: PollsService) {}

  @Get()
  async getPolls(
    @Query('page', ParseIntPipe) page: number,
    @Query('limit', ParseIntPipe) limit: number,
  ): Promise<PollsByPage> {
    return await this.pollsService.findAll(page, limit);
  }

  @Get(':id')
  async getUser(@Param('id', ParseIntPipe) id: number): Promise<PollsEntity | null> {
    return await this.pollsService.findPollById(id);
  }

  @Post()
  async createPoll(@Body() pollsDto: PollsDto, @CurrentUser() user: DecodedUser): Promise<PollsEntity> {
    console.log(user);
    return this.pollsService.create(pollsDto, user);
  }

  @Delete()
  async deletePolls() {
    return this.pollsService.deleteAll();
  }
}

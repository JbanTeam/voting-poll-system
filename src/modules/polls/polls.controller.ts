import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { PollsService } from './polls.service';
import { PollsEntity } from './polls.entity';
import { PollsDto } from './dto/polls.dto';

@Controller('polls')
export class PollsController {
  constructor(private pollsService: PollsService) {}

  @Get()
  async getPolls(): Promise<PollsEntity[]> {
    return await this.pollsService.findAll();
  }

  @Get(':id')
  async getUser(@Param('id', ParseIntPipe) id: number): Promise<PollsEntity | null> {
    return await this.pollsService.findPollById(id);
  }

  @Post()
  async createPoll(@Body() pollsDto: PollsDto): Promise<any> {
    return this.pollsService.create(pollsDto);
  }
}

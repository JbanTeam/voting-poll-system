import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';

import { PollService } from './poll.service';
import { PollDto } from './dto/poll.dto';
import { PollUpdateDto } from './dto/poll-update.dto';
import { PollEntity, PollStatus } from './poll.entity';
import { UserAnswerDto } from '@modules/user-answer/dto/user-answer.dto';
import { PollStatisticService } from '@modules/poll-statistics/poll-statistics.service';
import { CurrentUser } from '@src/utils/decorators/current-user.decorator';
import { DecodedUser, PollsByPage, PollStatistics } from '@src/types/types';

@Controller('polls')
export class PollController {
  constructor(
    private pollService: PollService,
    private pollStatisticService: PollStatisticService,
  ) {}

  @Get()
  async getAllPolls(
    @Query('page', ParseIntPipe) page: number,
    @Query('limit', ParseIntPipe) limit: number,
  ): Promise<PollsByPage> {
    return await this.pollService.findAllPolls({ page, limit });
  }

  @Get('own')
  async getOwnPolls(
    @Query('page', ParseIntPipe) page: number,
    @Query('limit', ParseIntPipe) limit: number,
    @CurrentUser() user: DecodedUser,
  ): Promise<PollsByPage> {
    return await this.pollService.findOwnPolls({ page, limit, user });
  }

  @Get(':pollId/statistics')
  async getPollStatistics(@Param('pollId', ParseIntPipe) pollId: number) {
    return await this.pollStatisticService.getPollStatistics({ pollId });
  }

  @Post()
  async createPoll(@Body() pollDto: PollDto, @CurrentUser() user: DecodedUser): Promise<PollEntity> {
    return this.pollService.createPoll({ pollDto, user });
  }

  @Post(':pollId/save-answers')
  async saveAnswers(
    @Body() userAnswersDto: UserAnswerDto,
    @Param('pollId', ParseIntPipe) pollId: number,
    @CurrentUser() user: DecodedUser,
  ): Promise<PollStatistics> {
    return this.pollService.saveAnswers({ userAnswersDto, user, pollId });
  }

  @Patch(':pollId/close')
  async closePoll(
    @Param('pollId', ParseIntPipe) pollId: number,
    @CurrentUser() user: DecodedUser,
  ): Promise<PollEntity | null> {
    return this.pollService.closePoll({ user, pollId, newStatus: PollStatus.CLOSED });
  }

  @Patch(':pollId/update')
  async updatePoll(
    @Body() pollUpdateDto: PollUpdateDto,
    @Param('pollId', ParseIntPipe) pollId: number,
    @CurrentUser() user: DecodedUser,
  ): Promise<PollEntity | null> {
    return this.pollService.updatePoll({ user, pollId, pollUpdateDto });
  }

  @Delete(':pollId')
  async deletePoll(
    @Param('pollId', ParseIntPipe) pollId: number,
    @CurrentUser() user: DecodedUser,
  ): Promise<{ message: string }> {
    return this.pollService.deletePoll({ user, pollId });
  }
}

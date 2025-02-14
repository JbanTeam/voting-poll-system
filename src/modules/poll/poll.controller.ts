import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';

import { PollService } from './poll.service';
import { PollEntity, PollStatus } from './poll.entity';
import { PollDto } from './dto/poll.dto';
import { CurrentUser } from '@src/utils/decorators/current-user.decorator';
import { DecodedUser, PollsByPage } from '@src/types/types';
import { UserAnswerDto } from '../user-answer/dto/user-answer.dto';
import { PollUpdateDto } from './dto/poll-update.dto';
import { PollStatisticService } from '../poll-statistics/poll-statistic.service';

@Controller('polls')
export class PollController {
  constructor(
    private pollsService: PollService,
    private pollStatisticService: PollStatisticService,
  ) {}

  @Get()
  async getAllPolls(
    @Query('page', ParseIntPipe) page: number,
    @Query('limit', ParseIntPipe) limit: number,
  ): Promise<PollsByPage> {
    return await this.pollsService.findAllPolls({ page, limit });
  }

  @Get('own')
  async getOwnPolls(
    @Query('page', ParseIntPipe) page: number,
    @Query('limit', ParseIntPipe) limit: number,
    @CurrentUser() user: DecodedUser,
  ): Promise<PollsByPage> {
    return await this.pollsService.findOwnPolls({ page, limit, user });
  }

  @Get(':pollId/statistics')
  async getPollStatistics(@Param('pollId', ParseIntPipe) pollId: number) {
    return await this.pollStatisticService.getPollStatistics({ pollId });
  }

  @Post()
  async createPoll(@Body() pollsDto: PollDto, @CurrentUser() user: DecodedUser): Promise<PollEntity> {
    return this.pollsService.createPoll({ pollsDto, user });
  }

  @Post(':pollId/save-answers')
  async saveAnswers(
    @Body() userAnswersDto: UserAnswerDto,
    @Param('pollId', ParseIntPipe) pollId: number,
    @CurrentUser() user: DecodedUser,
  ) {
    return this.pollsService.saveAnswers({ userAnswersDto, decodedUser: user, pollId });
  }

  @Patch(':pollId/close')
  async closePoll(
    @Param('pollId', ParseIntPipe) pollId: number,
    @CurrentUser() user: DecodedUser,
  ): Promise<PollEntity | null> {
    return this.pollsService.closePoll({ user, pollId, newStatus: PollStatus.CLOSED });
  }

  @Patch(':pollId/update')
  async updatePoll(
    @Body() pollUpdateDto: PollUpdateDto,
    @Param('pollId', ParseIntPipe) pollId: number,
    @CurrentUser() user: DecodedUser,
  ): Promise<PollEntity | null> {
    return this.pollsService.updatePoll({ user, pollId, pollUpdateDto });
  }

  @Delete(':pollId')
  async deletePoll(@Param('pollId', ParseIntPipe) pollId: number, @CurrentUser() user: DecodedUser) {
    return this.pollsService.deletePoll({ user, pollId });
  }
}

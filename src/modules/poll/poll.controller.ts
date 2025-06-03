import { Body, Param, ParseIntPipe, Query } from '@nestjs/common';

import { PollDto } from './dto/poll.dto';
import { PollService } from './poll.service';
import { PollUpdateDto } from './dto/poll-update.dto';
import { UserAnswerDto } from '@modules/user-answer/dto/user-answer.dto';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { PollStatisticsService } from '@modules/poll-statistics/poll-statistics.service';
import { PollEntity, PollStatus } from './poll.entity';
import { DecodedUser, PollsByPage, PollStatistics } from '@src/types/types';
import {
  AllPolls,
  ClosePoll,
  CreatePoll,
  DeletePoll,
  GetPoll,
  GetPollStatistics,
  OwnPolls,
  Poll,
  SaveAnswers,
  UpdatePoll,
} from '@common/decorators/poll.controller.decorator';

@Poll()
export class PollController {
  constructor(
    private pollService: PollService,
    private pollStatisticsService: PollStatisticsService,
  ) {}

  @AllPolls()
  async getAllPolls(
    @Query('page', ParseIntPipe) page: number,
    @Query('limit', ParseIntPipe) limit: number,
  ): Promise<PollsByPage> {
    return this.pollService.findAllPolls({ page, limit });
  }

  @OwnPolls()
  async getOwnPolls(
    @Query('page', ParseIntPipe) page: number,
    @Query('limit', ParseIntPipe) limit: number,
    @CurrentUser() user: DecodedUser,
  ): Promise<PollsByPage> {
    return this.pollService.findOwnPolls({ page, limit, user });
  }

  @GetPoll()
  async getPoll(@Param('pollId', ParseIntPipe) pollId: number): Promise<PollEntity | null> {
    return this.pollService.findPoll(pollId);
  }

  @GetPollStatistics()
  async getPollStatistics(@Param('pollId', ParseIntPipe) pollId: number): Promise<PollStatistics> {
    return this.pollStatisticsService.getPollStatistics({ pollId });
  }

  @CreatePoll()
  async createPoll(@Body() pollDto: PollDto, @CurrentUser() user: DecodedUser): Promise<PollEntity> {
    return this.pollService.createPoll({ pollDto, user });
  }

  @SaveAnswers()
  async saveAnswers(
    @Body() userAnswersDto: UserAnswerDto,
    @Param('pollId', ParseIntPipe) pollId: number,
    @CurrentUser() user: DecodedUser,
  ): Promise<PollStatistics> {
    return this.pollService.saveAnswers({ userAnswersDto, user, pollId });
  }

  @ClosePoll()
  async closePoll(
    @Param('pollId', ParseIntPipe) pollId: number,
    @CurrentUser() user: DecodedUser,
  ): Promise<PollEntity | null> {
    return this.pollService.closePoll({ user, pollId, newStatus: PollStatus.CLOSED });
  }

  @UpdatePoll()
  async updatePoll(
    @Body() pollUpdateDto: PollUpdateDto,
    @Param('pollId', ParseIntPipe) pollId: number,
    @CurrentUser() user: DecodedUser,
  ): Promise<PollEntity | null> {
    return this.pollService.updatePoll({ user, pollId, pollUpdateDto });
  }

  @DeletePoll()
  async deletePoll(
    @Param('pollId', ParseIntPipe) pollId: number,
    @CurrentUser() user: DecodedUser,
  ): Promise<{ message: string }> {
    return this.pollService.deletePoll({ user, pollId });
  }
}

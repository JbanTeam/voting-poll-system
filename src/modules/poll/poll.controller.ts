import {
  ApiBadRequestResponse,
  ApiExtraModels,
  ApiNotFoundResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';

import { PollService } from './poll.service';
import { PollDto } from './dto/poll.dto';
import { PollUpdateDto } from './dto/poll-update.dto';
import { PollEntity, PollStatus } from './poll.entity';
import { UserAnswerDto } from '@modules/user-answer/dto/user-answer.dto';
import { QuestionEntity } from '@modules/question/question.entity';
import { AnswerEntity } from '@modules/answer/answer.entity';
import { UserAnswerEntity } from '@modules/user-answer/user-answer.entity';
import { PollStatisticsService } from '@modules/poll-statistics/poll-statistics.service';
import { PollStatisticsEntity } from '@modules/poll-statistics/poll-statistics.entity';
import { CurrentUser } from '@src/utils/decorators/current-user.decorator';
import { DecodedUser, PollsByPage, PollStatistics } from '@src/types/types';
import {
  closePollApiResponse,
  closePollBadRequestApiResponse,
  closePollNotFoundApiResponse,
  deletePollNotFoundApiResponse,
  getPollsApiResponse,
  getPollStatisticsApiResponse,
  saveAnswersBadRequestApiResponse,
  saveAnswersNotFoundApiResponse,
  updatePollApiResponse,
  updatePollBadRequestApiResponse,
  updatePollNotFoundApiResponse,
} from '@src/utils/swaggerUtils';

@ApiExtraModels(QuestionEntity, AnswerEntity, PollStatisticsEntity, UserAnswerEntity)
@ApiTags('Polls')
@Controller('polls')
export class PollController {
  constructor(
    private pollService: PollService,
    private pollStatisticsService: PollStatisticsService,
  ) {}

  @ApiOperation({ summary: 'Get all polls' })
  @ApiResponse({ ...getPollsApiResponse, description: 'Get all polls' })
  @Get()
  async getAllPolls(
    @Query('page', ParseIntPipe) page: number,
    @Query('limit', ParseIntPipe) limit: number,
  ): Promise<PollsByPage> {
    return this.pollService.findAllPolls({ page, limit });
  }

  @ApiOperation({ summary: 'Get own polls' })
  @ApiResponse({ ...getPollsApiResponse, description: 'Get own polls' })
  @Get('own')
  async getOwnPolls(
    @Query('page', ParseIntPipe) page: number,
    @Query('limit', ParseIntPipe) limit: number,
    @CurrentUser() user: DecodedUser,
  ): Promise<PollsByPage> {
    return this.pollService.findOwnPolls({ page, limit, user });
  }

  @ApiOperation({ summary: 'Get poll' })
  @ApiResponse({ type: PollEntity, status: 200, description: 'Get poll' })
  @Get(':pollId')
  async getPoll(@Param('pollId', ParseIntPipe) pollId: number): Promise<PollEntity | null> {
    return this.pollService.findPoll(pollId);
  }

  @ApiOperation({ summary: 'Get poll statistics' })
  @ApiResponse(getPollStatisticsApiResponse)
  @Get(':pollId/statistics')
  async getPollStatistics(@Param('pollId', ParseIntPipe) pollId: number): Promise<PollStatistics> {
    return this.pollStatisticsService.getPollStatistics({ pollId });
  }

  @ApiOperation({ summary: 'Create new poll' })
  @ApiResponse({ type: PollEntity, status: 201 })
  @Post()
  async createPoll(@Body() pollDto: PollDto, @CurrentUser() user: DecodedUser): Promise<PollEntity> {
    return this.pollService.createPoll({ pollDto, user });
  }

  @ApiOperation({ summary: 'Save user answers' })
  @ApiResponse({ ...getPollStatisticsApiResponse, status: 201 })
  @ApiNotFoundResponse(saveAnswersNotFoundApiResponse)
  @ApiBadRequestResponse(saveAnswersBadRequestApiResponse)
  @Post(':pollId/save-answers')
  async saveAnswers(
    @Body() userAnswersDto: UserAnswerDto,
    @Param('pollId', ParseIntPipe) pollId: number,
    @CurrentUser() user: DecodedUser,
  ): Promise<PollStatistics> {
    return this.pollService.saveAnswers({ userAnswersDto, user, pollId });
  }

  @ApiOperation({ summary: 'Close poll' })
  @ApiResponse(closePollApiResponse)
  @ApiNotFoundResponse(closePollNotFoundApiResponse)
  @ApiBadRequestResponse(closePollBadRequestApiResponse)
  @Patch(':pollId/close')
  async closePoll(
    @Param('pollId', ParseIntPipe) pollId: number,
    @CurrentUser() user: DecodedUser,
  ): Promise<PollEntity | null> {
    return this.pollService.closePoll({ user, pollId, newStatus: PollStatus.CLOSED });
  }

  @ApiOperation({
    summary: 'Update poll',
    description:
      'All fields are optional. If ID of existing question or answer is passed, it will be updated, otherwise a new question or answer will be created and existing question or answer will be deleted.',
  })
  @ApiResponse(updatePollApiResponse)
  @ApiNotFoundResponse(updatePollNotFoundApiResponse)
  @ApiBadRequestResponse(updatePollBadRequestApiResponse)
  @Patch(':pollId/update')
  async updatePoll(
    @Body() pollUpdateDto: PollUpdateDto,
    @Param('pollId', ParseIntPipe) pollId: number,
    @CurrentUser() user: DecodedUser,
  ): Promise<PollEntity | null> {
    return this.pollService.updatePoll({ user, pollId, pollUpdateDto });
  }

  @ApiOperation({ summary: 'Delete poll' })
  @ApiResponse({ example: { message: 'Poll deleted successfully.' }, status: 200 })
  @ApiNotFoundResponse(deletePollNotFoundApiResponse)
  @Delete(':pollId')
  async deletePoll(
    @Param('pollId', ParseIntPipe) pollId: number,
    @CurrentUser() user: DecodedUser,
  ): Promise<{ message: string }> {
    return this.pollService.deletePoll({ user, pollId });
  }
}

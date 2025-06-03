import { Body, Controller, Delete, Get, HttpStatus, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiExtraModels,
  ApiNotFoundResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { PollDto } from './dto/poll.dto';
import { PollService } from './poll.service';
import { PollUpdateDto } from './dto/poll-update.dto';
import { AnswerEntity } from '@modules/answer/answer.entity';
import { QuestionEntity } from '@modules/question/question.entity';
import { UserAnswerDto } from '@modules/user-answer/dto/user-answer.dto';
import { UserAnswerEntity } from '@modules/user-answer/user-answer.entity';
import { CurrentUser } from '@src/utils/decorators/current-user.decorator';
import { PollStatisticsEntity } from '@modules/poll-statistics/poll-statistics.entity';
import { PollStatisticsService } from '@modules/poll-statistics/poll-statistics.service';
import { PollEntity, PollStatus } from './poll.entity';
import { DecodedUser, PollsByPage, PollStatistics } from '@src/types/types';
import {
  closePollApiResponse,
  closePollBadRequestApiResponse,
  closePollNotFoundApiResponse,
  createUnauthorizedApiResponse,
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
@ApiBearerAuth()
@Controller('polls')
export class PollController {
  constructor(
    private pollService: PollService,
    private pollStatisticsService: PollStatisticsService,
  ) {}

  @ApiOperation({ summary: 'Get all polls' })
  @ApiResponse({ ...getPollsApiResponse, description: 'Get all polls' })
  @ApiUnauthorizedResponse(createUnauthorizedApiResponse('/api/polls'))
  @Get()
  async getAllPolls(
    @Query('page', ParseIntPipe) page: number,
    @Query('limit', ParseIntPipe) limit: number,
  ): Promise<PollsByPage> {
    return this.pollService.findAllPolls({ page, limit });
  }

  @ApiOperation({ summary: 'Get own polls' })
  @ApiResponse({ ...getPollsApiResponse, description: 'Get own polls' })
  @ApiUnauthorizedResponse(createUnauthorizedApiResponse('/api/polls/own'))
  @Get('own')
  async getOwnPolls(
    @Query('page', ParseIntPipe) page: number,
    @Query('limit', ParseIntPipe) limit: number,
    @CurrentUser() user: DecodedUser,
  ): Promise<PollsByPage> {
    return this.pollService.findOwnPolls({ page, limit, user });
  }

  @ApiOperation({ summary: 'Get poll' })
  @ApiResponse({ type: PollEntity, status: HttpStatus.OK, description: 'Get poll' })
  @ApiUnauthorizedResponse(createUnauthorizedApiResponse('/api/polls/:pollId'))
  @Get(':pollId')
  async getPoll(@Param('pollId', ParseIntPipe) pollId: number): Promise<PollEntity | null> {
    return this.pollService.findPoll(pollId);
  }

  @ApiOperation({ summary: 'Get poll statistics' })
  @ApiResponse(getPollStatisticsApiResponse)
  @ApiUnauthorizedResponse(createUnauthorizedApiResponse('/api/polls/:pollId/statistics'))
  @Get(':pollId/statistics')
  async getPollStatistics(@Param('pollId', ParseIntPipe) pollId: number): Promise<PollStatistics> {
    return this.pollStatisticsService.getPollStatistics({ pollId });
  }

  @ApiOperation({ summary: 'Create new poll' })
  @ApiResponse({ type: PollEntity, status: HttpStatus.CREATED })
  @ApiUnauthorizedResponse(createUnauthorizedApiResponse('/api/polls'))
  @Post()
  async createPoll(@Body() pollDto: PollDto, @CurrentUser() user: DecodedUser): Promise<PollEntity> {
    return this.pollService.createPoll({ pollDto, user });
  }

  @ApiOperation({ summary: 'Save user answers' })
  @ApiResponse({ ...getPollStatisticsApiResponse, status: HttpStatus.CREATED })
  @ApiNotFoundResponse(saveAnswersNotFoundApiResponse)
  @ApiBadRequestResponse(saveAnswersBadRequestApiResponse)
  @ApiUnauthorizedResponse(createUnauthorizedApiResponse('/api/polls/:pollId/save-answers'))
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
  @ApiUnauthorizedResponse(createUnauthorizedApiResponse('/api/polls/:pollId/close'))
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
  @ApiUnauthorizedResponse(createUnauthorizedApiResponse('/api/polls/:pollId/update'))
  @Patch(':pollId/update')
  async updatePoll(
    @Body() pollUpdateDto: PollUpdateDto,
    @Param('pollId', ParseIntPipe) pollId: number,
    @CurrentUser() user: DecodedUser,
  ): Promise<PollEntity | null> {
    return this.pollService.updatePoll({ user, pollId, pollUpdateDto });
  }

  @ApiOperation({ summary: 'Delete poll' })
  @ApiResponse({ example: { message: 'Poll deleted successfully.' }, status: HttpStatus.OK })
  @ApiNotFoundResponse(deletePollNotFoundApiResponse)
  @ApiUnauthorizedResponse(createUnauthorizedApiResponse('/api/polls/:pollId'))
  @Delete(':pollId')
  async deletePoll(
    @Param('pollId', ParseIntPipe) pollId: number,
    @CurrentUser() user: DecodedUser,
  ): Promise<{ message: string }> {
    return this.pollService.deletePoll({ user, pollId });
  }
}

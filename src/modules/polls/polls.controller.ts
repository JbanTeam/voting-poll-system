import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { PollsService } from './polls.service';
import { PollsEntity, PollStatus } from './polls.entity';
import { PollsDto } from './dto/polls.dto';
import { CurrentUser } from 'src/utils/decorators/current-user.decorator';
import { DecodedUser, PollsByPage } from 'src/types/types';
import { UserAnswersDto } from '../user-answers/dto/user-answers.dto';

@Controller('polls')
export class PollsController {
  constructor(private pollsService: PollsService) {}

  @Get()
  async getAllPolls(
    @Query('page', ParseIntPipe) page: number,
    @Query('limit', ParseIntPipe) limit: number,
  ): Promise<PollsByPage> {
    return await this.pollsService.findAll({ page, limit });
  }

  @Get('/own')
  async getOwnPolls(
    @Query('page', ParseIntPipe) page: number,
    @Query('limit', ParseIntPipe) limit: number,
    @CurrentUser() user: DecodedUser,
  ): Promise<PollsByPage> {
    return await this.pollsService.findOwnPolls({ page, limit, user });
  }

  @Get('/questions')
  async getAllQuestions() {
    return this.pollsService.getAllQuestions();
  }

  @Get('/answers')
  async getAllAnswers() {
    return this.pollsService.getAllAnswers();
  }

  @Get(':pollId/statistics')
  async getPollStatistics(@Param('pollId', ParseIntPipe) pollId: number) {
    return await this.pollsService.getPollStatistics({ pollId });
  }

  @Post()
  async createPoll(@Body() pollsDto: PollsDto, @CurrentUser() user: DecodedUser): Promise<PollsEntity> {
    return this.pollsService.create({ pollsDto, user });
  }

  @Post(':pollId/save-answers')
  async saveAnswers(
    @Body() userAnswersDto: UserAnswersDto,
    @Param('pollId', ParseIntPipe) pollId: number,
    @CurrentUser() user: DecodedUser,
  ) {
    return this.pollsService.saveAnswers({ userAnswersDto, decodedUser: user, pollId });
  }

  @Patch(':pollId/close')
  async closePoll(
    @Param('pollId', ParseIntPipe) pollId: number,
    @CurrentUser() user: DecodedUser,
  ): Promise<{ message: string }> {
    return this.pollsService.closePoll({ user, pollId, newStatus: PollStatus.CLOSED });
  }

  @Delete()
  async deletePolls() {
    return this.pollsService.deleteAll();
  }
}

import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { PollsService } from './polls.service';
import { PollsEntity } from './polls.entity';
import { PollsDto } from './dto/polls.dto';
import { CurrentUser } from 'src/utils/decorators/current-user.decorator';
import { DecodedUser, PollsByPage } from 'src/types/types';
import { UserAnswersDto } from '../user-answers/dto/user-answers.dto';
import { PollStatisticsEntity } from '../poll-statistics/poll-statistics.entity';

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

  @Get('/questions')
  async getAllQuestions() {
    return this.pollsService.getAllQuestions();
  }

  @Get('/answers')
  async getAllAnswers() {
    return this.pollsService.getAllAnswers();
  }

  @Get(':projectId')
  async getPoll(@Param('projectId', ParseIntPipe) projectId: number): Promise<PollsEntity | null> {
    return await this.pollsService.findPollById(projectId);
  }

  @Post()
  async createPoll(@Body() pollsDto: PollsDto, @CurrentUser() user: DecodedUser): Promise<PollsEntity> {
    return this.pollsService.create(pollsDto, user);
  }

  @Post(':projectId/save-answers')
  async saveAnswers(
    @Body() userAnswersDto: UserAnswersDto,
    @Param('projectId', ParseIntPipe) projectId: number,
    @CurrentUser() user: DecodedUser,
  ): Promise<PollStatisticsEntity[]> {
    return this.pollsService.saveAnswers(userAnswersDto, user, projectId);
  }

  @Delete()
  async deletePolls() {
    return this.pollsService.deleteAll();
  }
}

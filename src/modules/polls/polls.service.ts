import { Injectable, NotFoundException } from '@nestjs/common';

import { PollsDto } from './dto/polls.dto';
import { PollsEntity } from './polls.entity';
import { DecodedUser, PollsByPage } from 'src/types/types';
import { QuestionsEntity } from '../questions/questions.entity';
import { AnswersEntity } from '../answers/answers.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { UserAnswersEntity } from '../user-answers/user-answers.entity';
import { UserAnswersDto } from '../user-answers/dto/user-answers.dto';
import { PollStatisticsEntity } from '../poll-statistics/poll-statistics.entity';

@Injectable()
export class PollsService {
  constructor(
    @InjectRepository(PollsEntity)
    private readonly pollsRepository: Repository<PollsEntity>,
    @InjectRepository(QuestionsEntity)
    private readonly questionsRepository: Repository<QuestionsEntity>,
    @InjectRepository(AnswersEntity)
    private readonly answersRepository: Repository<AnswersEntity>,
    @InjectRepository(UserAnswersEntity)
    private readonly userAnswersRepository: Repository<UserAnswersEntity>,
    @InjectRepository(PollStatisticsEntity)
    private readonly pollStatisticsRepository: Repository<PollStatisticsEntity>,
    private usersService: UsersService,
  ) {}

  async findAll(page: number, limit: number): Promise<PollsByPage> {
    const [polls, count] = await this.pollsRepository.findAndCount({
      select: ['title', 'description', 'createdAt'],
      take: limit,
      skip: (page - 1) * limit,
    });

    return {
      data: polls,
      total: count,
      page,
      pageCount: Math.ceil(count / limit),
    };
  }

  async findPollById(id: number): Promise<PollsEntity | null> {
    return this.pollsRepository.findOne({ where: { id } });
  }

  async getAllQuestions(): Promise<QuestionsEntity[]> {
    return this.questionsRepository.find({ relations: ['poll', 'answers'] });
  }

  async getAllAnswers(): Promise<AnswersEntity[]> {
    return this.answersRepository.find({ relations: ['question'] });
  }

  async create(pollsDto: PollsDto, user: DecodedUser): Promise<PollsEntity> {
    const poll = this.pollsRepository.create({ ...pollsDto, author: { id: user.userId } });
    return await this.pollsRepository.save(poll);
  }

  async saveAnswers(
    { userAnswers }: UserAnswersDto,
    { userId }: DecodedUser,
    pollId: number,
  ): Promise<PollStatisticsEntity[]> {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const answers = userAnswers.map(answer => {
      return this.userAnswersRepository.create({
        user: { id: userId },
        question: { id: answer.questionId },
        answer: { id: answer.answerId },
      });
    });

    await this.userAnswersRepository.save(answers);

    await Promise.all(userAnswers.map(answer => this.updatePollStatistics(answer.answerId, pollId)));

    return await this.getPollStatistics(pollId);
  }

  private async updatePollStatistics(answerId: number, pollId: number) {
    const existingStat = await this.pollStatisticsRepository.findOne({
      where: { poll: { id: pollId }, answer: { id: answerId } },
    });

    if (existingStat) {
      await this.pollStatisticsRepository.update(
        { poll: { id: pollId }, answer: { id: answerId } },
        { count: existingStat.count + 1 },
      );
    } else {
      const newStat = this.pollStatisticsRepository.create({
        poll: { id: pollId },
        answer: { id: answerId },
        count: 1,
      });
      await this.pollStatisticsRepository.save(newStat);
    }
  }

  async getPollStatistics(pollId: number): Promise<PollStatisticsEntity[]> {
    return this.pollStatisticsRepository.find({
      where: { poll: { id: pollId } },
      select: ['answer', 'count'],
      relations: ['answer'],
      order: { count: 'DESC' },
    });
  }

  async deleteAll() {
    return this.pollsRepository.delete({});
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';

import { PollDto } from './dto/poll.dto';
import { PollEntity, PollStatus } from './poll.entity';
import { DecodedUser, PollsByPage, PollStatistics } from 'src/types/types';
import { QuestionEntity } from '../question/question.entity';
import { AnswerEntity } from '../answer/answer.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserAnswerEntity } from '../user-answer/user-answer.entity';
import { UserAnswerDto } from '../user-answer/dto/user-answer.dto';
import { PollUpdateDto } from './dto/poll-update.dto';
import { PollStatisticService } from '../poll-statistics/poll-statistic.service';
import {
  validateAnsweredQuestions,
  validateNewStatus,
  validatePollAuthor,
  validatePollExists,
  validatePollStatus,
  validateUserExists,
} from 'src/utils/checkExists';

@Injectable()
export class PollService {
  constructor(
    @InjectRepository(PollEntity)
    private readonly pollsRepository: Repository<PollEntity>,
    @InjectRepository(QuestionEntity)
    private readonly questionsRepository: Repository<QuestionEntity>,
    @InjectRepository(AnswerEntity)
    private readonly answersRepository: Repository<AnswerEntity>,
    private readonly pollStatisticService: PollStatisticService,
  ) {}

  async findAll({ page, limit }: { page: number; limit: number }): Promise<PollsByPage> {
    const [polls, count] = await this.pollsRepository.findAndCount({
      select: ['id', 'title', 'description', 'createdAt'],
      where: { status: PollStatus.ACTIVE },
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

  async findOwnPolls({ page, limit, user }: { page: number; limit: number; user: DecodedUser }): Promise<PollsByPage> {
    const [polls, count] = await this.pollsRepository.findAndCount({
      select: ['id', 'title', 'description', 'status', 'createdAt', 'updatedAt', 'closedAt'],
      where: { author: { id: user.userId } },
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

  async getAllQuestions(): Promise<QuestionEntity[]> {
    return this.questionsRepository.find({ relations: ['poll', 'answers'] });
  }

  async getAllAnswers(): Promise<AnswerEntity[]> {
    return this.answersRepository.find({ relations: ['question'] });
  }

  async create({ pollsDto, user }: { pollsDto: PollDto; user: DecodedUser }): Promise<PollEntity> {
    return this.pollsRepository.manager.transaction(async entityManager => {
      const poll = entityManager.create(PollEntity, {
        ...pollsDto,
        author: { id: user.userId },
      });

      const savedPoll = await entityManager.save(PollEntity, poll);

      const fullPoll = await entityManager.findOne(PollEntity, {
        where: { id: savedPoll.id },
        relations: ['questions', 'questions.answers', 'questions.answers.question'],
      });

      if (!fullPoll) {
        throw new NotFoundException('Poll not found');
      }

      const allAnswers = fullPoll.questions.flatMap(question => question.answers);

      await this.pollStatisticService.createPollStatistics({
        answers: allAnswers,
        pollId: savedPoll.id,
        entityManager,
      });

      return fullPoll;
    });
  }

  async closePoll({
    user,
    pollId,
    newStatus,
  }: {
    user: DecodedUser;
    pollId: number;
    newStatus: PollStatus;
  }): Promise<{ message: string }> {
    validateNewStatus(newStatus);

    const poll = await validatePollExists(pollId, this.pollsRepository.manager);
    validatePollAuthor(poll, user);

    validatePollStatus(poll.status, newStatus);

    await this.pollsRepository.update({ id: pollId }, { status: newStatus, closedAt: new Date() });

    return { message: 'Poll closed successfully' };
  }

  async updatePoll({
    user,
    pollId,
    pollUpdateDto,
  }: {
    user: DecodedUser;
    pollId: number;
    pollUpdateDto: PollUpdateDto;
  }): Promise<{ message: string }> {
    console.log(pollUpdateDto);
    const poll = await validatePollExists(pollId, this.pollsRepository.manager);
    validatePollAuthor(poll, user);

    await this.pollsRepository.update({ id: pollId }, {});

    return { message: 'Poll updated successfully' };
  }

  async saveAnswers({
    userAnswersDto,
    decodedUser,
    pollId,
  }: {
    userAnswersDto: UserAnswerDto;
    decodedUser: DecodedUser;
    pollId: number;
  }): Promise<PollStatistics> {
    const { userId } = decodedUser;
    const { userAnswers } = userAnswersDto;

    return this.pollsRepository.manager.transaction(async entityManager => {
      await validateUserExists(userId, entityManager);

      await validatePollExists(pollId, entityManager);

      await validateAnsweredQuestions(userId, userAnswers, entityManager);

      const answers = userAnswers.map(answer => {
        return entityManager.create(UserAnswerEntity, {
          user: { id: userId },
          question: { id: answer.questionId },
          answer: { id: answer.answerId },
        });
      });

      await entityManager.save(UserAnswerEntity, answers);

      await this.pollStatisticService.updatePollStatistics({ answers, pollId, entityManager });

      return await this.pollStatisticService.getPollStatistics({ pollId, entityManager });
    });
  }

  async deleteAll() {
    return this.pollsRepository.delete({});
  }
}

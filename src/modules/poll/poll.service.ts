import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

import { PollUpdateDto } from './dto/poll-update.dto';
import { PollDto } from './dto/poll.dto';
import { PollEntity, PollStatus } from './poll.entity';
import { QuestionEntity } from '@modules/question/question.entity';
import { AnswerEntity } from '@modules/answer/answer.entity';
import { PollStatisticsService } from '@modules/poll-statistics/poll-statistics.service';
import { UserAnswerEntity } from '@modules/user-answer/user-answer.entity';
import { UserAnswer, UserAnswerDto } from '@modules/user-answer/dto/user-answer.dto';
import { DecodedUser, PollsByPage, PollStatistics } from '@src/types/types';
import {
  validateAnyoneAnswered,
  validateNewStatus,
  validatePollAnswered,
  validatePollExists,
  validatePollStatus,
  validateUserExists,
} from '@src/utils/checkExists';

@Injectable()
export class PollService {
  constructor(
    @InjectRepository(PollEntity)
    private readonly pollRepository: Repository<PollEntity>,
    private readonly pollStatisticsService: PollStatisticsService,
  ) {}

  async findAllPolls({ page, limit }: { page: number; limit: number }): Promise<PollsByPage> {
    const [polls, count] = await this.pollRepository.findAndCount({
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
    const [polls, count] = await this.pollRepository.findAndCount({
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

  async findPoll(pollId: number): Promise<PollEntity | null> {
    return await this.pollRepository.findOne({
      select: ['id', 'title', 'description', 'createdAt'],
      relations: ['questions', 'questions.answers'],
      where: { id: pollId },
    });
  }

  async createPoll({ pollDto, user }: { pollDto: PollDto; user: DecodedUser }): Promise<PollEntity> {
    return this.pollRepository.manager.transaction(async entityManager => {
      const poll = entityManager.create(PollEntity, {
        ...pollDto,
        author: { id: user.userId },
      });

      const savedPoll = await entityManager.save(PollEntity, poll);

      const fullPoll = await validatePollExists({
        pollId: savedPoll.id,
        relations: ['questions', 'questions.answers', 'questions.answers.question'],
        entityManager,
      });

      const allAnswers = fullPoll.questions.flatMap(question => question.answers);

      await this.pollStatisticsService.createPollStatistics({
        answers: allAnswers,
        pollId: savedPoll.id,
        entityManager,
      });

      return fullPoll;
    });
  }

  async deletePoll({ user, pollId }: { user: DecodedUser; pollId: number }): Promise<{ message: string }> {
    return this.pollRepository.manager.transaction(async entityManager => {
      await validateUserExists({ userId: user.userId, entityManager });

      await validatePollExists({ pollId, authorId: user.userId, entityManager });

      await entityManager.delete(PollEntity, { id: pollId });

      return { message: 'Poll deleted successfully.' };
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
  }): Promise<PollEntity | null> {
    validateNewStatus(newStatus);

    const entityManager = this.pollRepository.manager;
    const poll = await validatePollExists({ pollId, authorId: user.userId, entityManager });

    validatePollStatus({ pollStatus: poll.status, newStatus });

    await entityManager.update(PollEntity, { id: pollId }, { status: newStatus, closedAt: new Date() });

    return entityManager.findOne(PollEntity, {
      where: { id: pollId },
      relations: ['questions', 'questions.answers'],
    });
  }

  async updatePoll({
    user,
    pollId,
    pollUpdateDto,
  }: {
    user: DecodedUser;
    pollId: number;
    pollUpdateDto: PollUpdateDto;
  }): Promise<PollEntity | null> {
    return this.pollRepository.manager.transaction(async entityManager => {
      await validateUserExists({ userId: user.userId, entityManager });

      const poll = await validatePollExists({
        pollId,
        authorId: user.userId,
        relations: ['author', 'questions', 'questions.answers'],
        entityManager,
      });

      await validateAnyoneAnswered({ pollId, entityManager });

      poll.title = pollUpdateDto.title || poll.title;
      poll.description = pollUpdateDto.description || poll.description;

      await this.updateQuestionsAndAnswers({ poll, pollUpdateDto, entityManager });

      const updatedPoll = await entityManager.save(PollEntity, poll);

      return entityManager.findOne(PollEntity, {
        where: { id: updatedPoll.id },
        relations: ['questions', 'questions.answers'],
      });
    });
  }

  async updateQuestionsAndAnswers({
    poll,
    pollUpdateDto,
    entityManager,
  }: {
    poll: PollEntity;
    pollUpdateDto: PollUpdateDto;
    entityManager: EntityManager;
  }) {
    if (pollUpdateDto.questions?.length) {
      const newQuestionIds = pollUpdateDto.questions.map(q => q.id).filter(id => id !== undefined);

      const questionsToDelete = poll.questions.filter(q => !newQuestionIds.includes(q.id));
      await entityManager.remove(QuestionEntity, questionsToDelete);

      poll.questions = await Promise.all(
        pollUpdateDto.questions.map(async questionDto => {
          const question = poll.questions.find(q => q.id === questionDto.id) || new QuestionEntity();
          if (questionDto.text) question.text = questionDto.text;

          if (questionDto.answers?.length && question?.answers?.length) {
            const newAnswerIds = questionDto.answers.map(a => a.id).filter(id => id !== undefined);

            const answersToDelete = question.answers.filter(a => !newAnswerIds.includes(a.id));
            await entityManager.remove(AnswerEntity, answersToDelete);

            question.answers = questionDto.answers.map(answerDto => {
              const answer = question.answers.find(a => a.id === answerDto.id) || new AnswerEntity();
              answer.text = answerDto.text;
              return answer;
            });
          }

          return question;
        }),
      );
    }
  }

  async saveAnswers({
    userAnswersDto,
    user,
    pollId,
  }: {
    userAnswersDto: UserAnswerDto;
    user: DecodedUser;
    pollId: number;
  }): Promise<PollStatistics> {
    const { userId } = user;
    const { userAnswers } = userAnswersDto;

    return this.pollRepository.manager.transaction(async entityManager => {
      await validateUserExists({ userId, entityManager });

      await validatePollExists({ pollId, where: { status: PollStatus.ACTIVE }, entityManager });

      await validatePollAnswered({ pollId, userId, entityManager });

      const answers = await this.createUserAnswers({
        userAnswers,
        entityManager,
        userId,
        pollId,
      });

      await entityManager.save(UserAnswerEntity, answers);

      await this.pollStatisticsService.updatePollStatistics({ answers, pollId, entityManager });

      return await this.pollStatisticsService.getPollStatistics({ pollId, entityManager });
    });
  }
  async createUserAnswers({
    userAnswers,
    entityManager,
    userId,
    pollId,
  }: {
    userAnswers: UserAnswer[];
    entityManager: EntityManager;
    userId: number;
    pollId: number;
  }) {
    return userAnswers.map(answer => {
      return entityManager.create(UserAnswerEntity, {
        user: { id: userId },
        question: { id: answer.questionId },
        answer: { id: answer.answerId },
        poll: { id: pollId },
      });
    });
  }
}

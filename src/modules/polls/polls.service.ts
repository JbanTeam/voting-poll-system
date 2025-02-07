import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import { PollsDto } from './dto/polls.dto';
import { PollsEntity, PollStatus } from './polls.entity';
import { DecodedUser, PollsByPage, PollStatistics } from 'src/types/types';
import { QuestionsEntity } from '../questions/questions.entity';
import { AnswersEntity } from '../answers/answers.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Repository } from 'typeorm';
import { UserAnswersEntity } from '../user-answers/user-answers.entity';
import { UserAnswersDto } from '../user-answers/dto/user-answers.dto';
import { PollStatisticsEntity } from '../poll-statistics/poll-statistics.entity';
import { UsersEntity } from '../users/users.entity';

@Injectable()
export class PollsService {
  constructor(
    @InjectRepository(PollsEntity)
    private readonly pollsRepository: Repository<PollsEntity>,
    @InjectRepository(QuestionsEntity)
    private readonly questionsRepository: Repository<QuestionsEntity>,
    @InjectRepository(AnswersEntity)
    private readonly answersRepository: Repository<AnswersEntity>,
    @InjectRepository(PollStatisticsEntity)
    private readonly pollStatisticsRepository: Repository<PollStatisticsEntity>,
  ) {}

  async findAll({ page, limit }: { page: number; limit: number }): Promise<PollsByPage> {
    const [polls, count] = await this.pollsRepository.findAndCount({
      select: ['title', 'description', 'createdAt'],
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

  async findPollById(id: number): Promise<PollsEntity | null> {
    return this.pollsRepository.findOne({ where: { id } });
  }

  async getAllQuestions(): Promise<QuestionsEntity[]> {
    return this.questionsRepository.find({ relations: ['poll', 'answers'] });
  }

  async getAllAnswers(): Promise<AnswersEntity[]> {
    return this.answersRepository.find({ relations: ['question'] });
  }

  async create({ pollsDto, user }: { pollsDto: PollsDto; user: DecodedUser }): Promise<PollsEntity> {
    return this.pollsRepository.manager.transaction(async entityManager => {
      const poll = entityManager.create(PollsEntity, {
        ...pollsDto,
        author: { id: user.userId },
      });

      const savedPoll = await entityManager.save(PollsEntity, poll);

      const fullPoll = await entityManager.findOne(PollsEntity, {
        where: { id: savedPoll.id },
        relations: ['questions', 'questions.answers', 'questions.answers.question'],
      });

      if (!fullPoll) {
        throw new NotFoundException('Poll not found');
      }

      const allAnswers = fullPoll.questions.flatMap(question => question.answers);

      await this.createPollStatistics(
        {
          answers: allAnswers,
          pollId: savedPoll.id,
        },
        entityManager,
      );

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
    if (newStatus !== PollStatus.CLOSED) {
      throw new BadRequestException('New status must be CLOSED');
    }

    const poll = await this.findPollById(pollId);

    if (!poll) {
      throw new NotFoundException('Poll not found');
    }

    if (poll.author.id !== user.userId) {
      throw new BadRequestException('You are not the author of this poll');
    }

    if (newStatus === poll.status) {
      throw new BadRequestException('Task is already in this status');
    }

    await this.pollsRepository.update({ id: pollId }, { status: newStatus });

    return { message: 'Poll closed successfully' };
  }

  async saveAnswers({
    userAnswersDto,
    decodedUser,
    pollId,
  }: {
    userAnswersDto: UserAnswersDto;
    decodedUser: DecodedUser;
    pollId: number;
  }): Promise<PollStatistics> {
    const { userId } = decodedUser;
    const { userAnswers } = userAnswersDto;
    return this.pollsRepository.manager.transaction(async entityManager => {
      const user = await entityManager.findOne(UsersEntity, {
        where: { id: userId },
      });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      const poll = await entityManager.findOne(PollsEntity, {
        where: { id: pollId },
      });
      if (!poll) {
        throw new NotFoundException('Poll not found');
      }

      const questionIds = userAnswers.map(answer => answer.questionId);

      const existingAnswers = await entityManager.find(UserAnswersEntity, {
        where: {
          user: { id: userId },
          question: { id: In(questionIds) },
        },
      });

      if (existingAnswers.length > 0) {
        throw new BadRequestException('You have already answered this poll');
      }

      const answers = userAnswers.map(answer => {
        return entityManager.create(UserAnswersEntity, {
          user: { id: userId },
          question: { id: answer.questionId },
          answer: { id: answer.answerId },
        });
      });

      await entityManager.save(UserAnswersEntity, answers);

      await this.updatePollStatistics({ answers, pollId, entityManager });

      return await this.getPollStatistics({ pollId, entityManager });
    });
  }

  private async createPollStatistics(
    { answers, pollId }: { answers: AnswersEntity[]; pollId: number },
    entityManager?: EntityManager,
  ) {
    const manager = entityManager || this.pollStatisticsRepository.manager;

    await manager
      .createQueryBuilder()
      .insert()
      .into('poll_statistics')
      .values(
        answers.map(answer => ({
          poll: { id: pollId },
          answer: { id: answer.id },
          question: { id: answer.question.id },
          count: 0,
        })),
      )
      .execute();
  }

  private async updatePollStatistics({
    answers,
    pollId,
    entityManager,
  }: {
    answers: UserAnswersEntity[];
    pollId: number;
    entityManager?: EntityManager;
  }) {
    const manager = entityManager || this.pollStatisticsRepository.manager;
    const existingRecords = await manager
      .createQueryBuilder(PollStatisticsEntity, 'poll_statistics')
      .where('poll_id = :pollId AND answer_id IN (:...answerIds)', {
        pollId,
        answerIds: answers.map(userAnswer => userAnswer.answer.id),
      })
      .getMany();

    if (existingRecords.length !== answers.length) {
      throw new BadRequestException('Cant update statistics. Some records do not exist');
    }

    await manager
      .createQueryBuilder()
      .update('poll_statistics')
      .set({ count: () => 'count + 1' })
      .where('poll_id = :pollId AND answer_id IN (:...answerIds)', {
        pollId,
        answerIds: answers.map(userAnswer => userAnswer.answer.id),
      })
      .execute();
  }

  async getPollStatistics({
    pollId,
    entityManager,
  }: {
    pollId: number;
    entityManager?: EntityManager;
  }): Promise<PollStatistics> {
    const manager = entityManager || this.pollStatisticsRepository.manager;
    const statistics = await manager.find(PollStatisticsEntity, {
      where: { poll: { id: pollId } },
      select: ['answer', 'count'],
      relations: ['poll', 'question', 'answer'],
      order: { count: 'DESC' },
    });

    const groupedStatistics = statistics.reduce<PollStatistics>((acc, stat) => {
      const questionId = stat.question.id;

      if (!acc[questionId]) {
        acc[questionId] = {
          title: stat.question.text,
          stats: [],
        };
      }

      acc[questionId].stats.push({
        count: stat.count,
        answer: {
          id: stat.answer.id,
          text: stat.answer.text,
        },
      });

      return acc;
    }, {});

    return groupedStatistics;
  }

  async deleteAll() {
    return this.pollsRepository.delete({});
  }
}

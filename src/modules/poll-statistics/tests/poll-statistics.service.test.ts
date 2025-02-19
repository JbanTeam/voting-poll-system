import { Request } from 'express';
import { createMock } from '@golevelup/ts-jest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { InsertQueryBuilder, Repository, SelectQueryBuilder, UpdateQueryBuilder } from 'typeorm';
import { INestApplication, ExecutionContext, BadRequestException } from '@nestjs/common';

import { PollEntity } from '@modules/poll/poll.entity';
import { PollController } from '@modules/poll/poll.controller';
import { PollService } from '@modules/poll/poll.service';
import { UserAnswerDto } from '@modules/user-answer/dto/user-answer.dto';
import { UserAnswerEntity } from '@modules/user-answer/user-answer.entity';
import { PollStatisticService } from '@modules/poll-statistics/poll-statistics.service';
import { PollStatisticsEntity } from '@modules/poll-statistics/poll-statistics.entity';
import { DecodedUser } from '@src/types/types';

const userAnswersDto: UserAnswerDto = {
  userAnswers: [
    { questionId: 1, answerId: 1 },
    { questionId: 2, answerId: 2 },
  ],
};

const pollId = 1;

const decodedUser: DecodedUser = { userId: 1 };

const answers = userAnswersDto.userAnswers.map(answer => {
  return {
    user: { id: decodedUser.userId },
    question: { id: answer.questionId },
    answer: { id: answer.answerId },
    poll: { id: pollId },
  } as UserAnswerEntity;
});

const poll = {
  id: 1,
  title: 'Test Poll',
  description: 'Test Description',
  author: { id: decodedUser.userId },
} as PollEntity;

const fullPoll = {
  ...poll,
  questions: [
    {
      id: 1,
      text: 'Question',
      answers: [
        { id: 1, text: 'Answer', question: { id: 1 } },
        { id: 2, text: 'Answer2', question: { id: 1 } },
      ],
    },
    { id: 2, text: 'Question2', answers: [{ id: 3, text: 'Answer3', question: { id: 2 } }] },
  ],
} as PollEntity;

const pollStatisticsMock = {
  id: 1,
  poll: fullPoll,
  question: { id: 1, text: 'Question' },
  answer: { id: 1, text: 'Answer' },
  count: 1,
} as PollStatisticsEntity;

const groupedStatisticsMock = {
  '1': {
    title: 'Question',
    stats: [
      {
        count: 1,
        answer: {
          id: 1,
          text: 'Answer',
        },
      },
    ],
  },
};

let mockInsertBuilder = {
  into: jest.fn().mockReturnThis(),
  values: jest.fn().mockReturnThis(),
  execute: jest.fn().mockResolvedValue(undefined),
} as unknown as InsertQueryBuilder<any>;

let mockUpdateBuilder = {
  set: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  execute: jest.fn().mockResolvedValue(undefined),
} as unknown as UpdateQueryBuilder<any>;

let mockQueryBuilder = {
  insert: jest.fn().mockReturnValue(mockInsertBuilder),
  where: jest.fn().mockReturnThis(),
  getMany: jest.fn().mockResolvedValue([]),
  update: jest.fn().mockReturnValue(mockUpdateBuilder),
} as unknown as SelectQueryBuilder<any>;

describe('PollStatisticsService', () => {
  let app: INestApplication;
  let pollStatisticService: PollStatisticService;
  let pollStatisticsRepository: Repository<PollStatisticsEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PollController],
      providers: [
        PollService,
        PollStatisticService,
        {
          provide: getRepositoryToken(PollEntity),
          useValue: createMock<Repository<PollEntity>>(),
        },
        {
          provide: getRepositoryToken(PollStatisticsEntity),
          useValue: createMock<Repository<PollStatisticsEntity>>(),
        },
        {
          provide: 'APP_GUARD',
          useValue: {
            canActivate: jest.fn((context: ExecutionContext) => {
              const req: Request = context.switchToHttp().getRequest();
              req.user = { userId: 1 };
              return true;
            }),
          },
        },
      ],
    }).compile();

    app = module.createNestApplication();
    await app.init();

    pollStatisticService = module.get<PollStatisticService>(PollStatisticService);
    pollStatisticsRepository = module.get<Repository<PollStatisticsEntity>>(getRepositoryToken(PollStatisticsEntity));

    mockInsertBuilder = {
      into: jest.fn().mockReturnThis(),
      values: jest.fn().mockReturnThis(),
      execute: jest.fn().mockResolvedValue(undefined),
    } as unknown as InsertQueryBuilder<any>;

    mockUpdateBuilder = {
      set: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      execute: jest.fn().mockResolvedValue(undefined),
    } as unknown as UpdateQueryBuilder<any>;

    mockQueryBuilder = {
      insert: jest.fn().mockReturnValue(mockInsertBuilder),
      where: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([]),
      update: jest.fn().mockReturnValue(mockUpdateBuilder),
    } as unknown as SelectQueryBuilder<any>;
  });

  afterEach(async () => {
    await app.close();
  });

  it('should get poll statistics', async () => {
    pollStatisticsRepository.manager.find = jest.fn().mockResolvedValue([pollStatisticsMock]);

    const result = await pollStatisticService.getPollStatistics({ pollId });

    expect(jest.spyOn(pollStatisticsRepository.manager, 'find')).toHaveBeenCalledWith(PollStatisticsEntity, {
      where: { poll: { id: pollId } },
      select: ['answer', 'count'],
      relations: ['poll', 'question', 'answer'],
      order: { count: 'DESC' },
    });
    expect(result).toEqual(groupedStatisticsMock);
  });

  it('should create poll statistics', async () => {
    const answers = fullPoll.questions.flatMap(question => question.answers);

    jest.spyOn(pollStatisticsRepository.manager, 'createQueryBuilder').mockReturnValue(mockQueryBuilder);

    await pollStatisticService.createPollStatistics({
      answers: fullPoll.questions.flatMap(question => question.answers),
      pollId,
      entityManager: pollStatisticsRepository.manager,
    });

    expect(jest.spyOn(pollStatisticsRepository.manager, 'createQueryBuilder')).toHaveBeenCalled();
    expect(jest.spyOn(mockQueryBuilder, 'insert')).toHaveBeenCalled();
    expect(jest.spyOn(mockInsertBuilder, 'into')).toHaveBeenCalledWith('poll_statistics');
    expect(jest.spyOn(mockInsertBuilder, 'values')).toHaveBeenCalledWith(
      answers.map(answer => ({
        poll: { id: pollId },
        answer: { id: answer.id },
        question: { id: answer.question.id },
        count: 0,
      })),
    );
    expect(jest.spyOn(mockInsertBuilder, 'execute')).toHaveBeenCalled();
  });

  it('should update poll statistics', async () => {
    mockQueryBuilder.getMany = jest.fn().mockResolvedValue(new Array(answers.length).fill(pollStatisticsMock));
    jest.spyOn(pollStatisticsRepository.manager, 'createQueryBuilder').mockReturnValue(mockQueryBuilder);

    await pollStatisticService.updatePollStatistics({
      answers,
      pollId,
      entityManager: pollStatisticsRepository.manager,
    });

    expect(jest.spyOn(pollStatisticsRepository.manager, 'createQueryBuilder')).toHaveBeenCalledWith(
      PollStatisticsEntity,
      'poll_statistics',
    );
    expect(jest.spyOn(mockQueryBuilder, 'where')).toHaveBeenCalledWith(
      'poll_id = :pollId AND answer_id IN (:...answerIds)',
      {
        pollId,
        answerIds: answers.map(userAnswer => userAnswer.answer.id),
      },
    );
    expect(jest.spyOn(mockQueryBuilder, 'getMany')).toHaveBeenCalled();

    expect(jest.spyOn(pollStatisticsRepository.manager, 'createQueryBuilder')).toHaveBeenCalledWith();
    expect(jest.spyOn(mockQueryBuilder, 'update')).toHaveBeenCalledWith('poll_statistics');
    expect(jest.spyOn(mockUpdateBuilder, 'set')).toHaveBeenCalledWith({
      count: expect.any(Function) as () => 'count + 1',
    });
    expect(jest.spyOn(mockUpdateBuilder, 'where')).toHaveBeenCalledWith(
      'poll_id = :pollId AND answer_id IN (:...answerIds)',
      {
        pollId,
        answerIds: answers.map(userAnswer => userAnswer.answer.id),
      },
    );
    expect(jest.spyOn(mockUpdateBuilder, 'execute')).toHaveBeenCalled();
  });

  it('should throw error if existing statistics count not match answers count', async () => {
    jest.spyOn(pollStatisticsRepository.manager, 'createQueryBuilder').mockReturnValue(mockQueryBuilder);

    await expect(
      pollStatisticService.updatePollStatistics({
        answers,
        pollId,
        entityManager: pollStatisticsRepository.manager,
      }),
    ).rejects.toThrow(new BadRequestException('Cant update statistics. Some records do not exist'));
  });
});

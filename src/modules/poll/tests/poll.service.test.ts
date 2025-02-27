import { Request } from 'express';
import { createMock } from '@golevelup/ts-jest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { EntityManager, Repository } from 'typeorm';
import { INestApplication, ExecutionContext, BadRequestException, NotFoundException } from '@nestjs/common';

import { UserEntity } from '@modules/user/user.entity';
import { PollController } from '@modules/poll/poll.controller';
import { QuestionEntity } from '@modules/question/question.entity';
import { AnswerEntity } from '@modules/answer/answer.entity';
import { UserAnswerDto } from '@modules/user-answer/dto/user-answer.dto';
import { UserAnswerEntity } from '@modules/user-answer/user-answer.entity';
import { PollService } from '@modules/poll/poll.service';
import { PollEntity, PollStatus } from '@modules/poll/poll.entity';
import { PollDto } from '@modules/poll/dto/poll.dto';
import { PollUpdateDto } from '@modules/poll/dto/poll-update.dto';
import { PollStatisticsService } from '@modules/poll-statistics/poll-statistics.service';
import * as checkExists from '@src/utils/checkExists';
import { DecodedUser, PollStatistics } from '@src/types/types';

const pollDto: PollDto = {
  title: 'Super poll',
  description: 'super description',
  questions: [
    {
      text: 'Question 1',
      answers: [{ text: 'Answer 1' }, { text: 'Answer 2' }],
    },
    {
      text: 'Question 2',
      answers: [{ text: 'Answer 1' }, { text: 'Answer 2' }],
    },
  ],
};

const pollUpdateDto: PollUpdateDto = {
  title: 'Updated Poll',
  questions: [
    {
      id: 1,
      text: 'Updated Question 1',
      answers: [{ id: 1, text: 'Updated Answer 1' }, { text: 'New Answer' }],
    },
  ],
};

const pollStatistics: PollStatistics = {
  '1': {
    title: 'How old are you?',
    stats: [
      {
        count: 1,
        answer: {
          id: 1,
          text: '18-25',
        },
      },
    ],
  },
};

const userAnswersDto: UserAnswerDto = {
  userAnswers: [
    { questionId: 1, answerId: 1 },
    { questionId: 2, answerId: 2 },
  ],
};

const pollId = 1;

const user = {
  id: 1,
  email: 'vital@mail.ru',
  password: '11111111',
  name: 'Vital Alex',
} as UserEntity;

const decodedUser: DecodedUser = { userId: 1 };

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
        { id: 1, text: 'Answer' },
        { id: 2, text: 'Answer2' },
      ],
    },
    { id: 2, text: 'Question2', answers: [{ id: 3, text: 'Answer3' }] },
  ],
} as PollEntity;

let mockEntityManager = {
  create: jest.fn<PollEntity, [typeof PollEntity, Partial<PollEntity>]>(),
  save: jest.fn(),
  delete: jest.fn(),
  findOne: jest.fn(),
  find: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('PollService', () => {
  let app: INestApplication;
  let pollService: PollService;
  let pollRepository: Repository<PollEntity>;
  let pollStatisticsService: PollStatisticsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PollController],
      providers: [
        PollService,
        {
          provide: getRepositoryToken(PollEntity),
          useValue: createMock<Repository<PollEntity>>(),
        },
        {
          provide: PollStatisticsService,
          useValue: {
            getPollStatistics: jest.fn(),
            createPollStatistics: jest.fn(),
            updatePollStatistics: jest.fn(),
          },
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

    pollService = module.get<PollService>(PollService);
    pollStatisticsService = module.get<PollStatisticsService>(PollStatisticsService);
    pollRepository = module.get<Repository<PollEntity>>(getRepositoryToken(PollEntity));

    mockEntityManager = {
      create: jest.fn<PollEntity, [typeof PollEntity, Partial<PollEntity>]>(),
      save: jest.fn(),
      delete: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };
  });

  afterEach(async () => {
    await app.close();
  });

  it('should get all polls', async () => {
    const polls = [new PollEntity()];
    const count = 1;
    jest.spyOn(pollRepository, 'findAndCount').mockResolvedValue([polls, count]);

    const result = await pollService.findAllPolls({ page: 1, limit: 10 });

    expect(result).toEqual({
      data: polls,
      total: count,
      page: 1,
      pageCount: 1,
    });
  });

  it('should get object with empty data array if no polls', async () => {
    const polls = [];
    const count = 0;
    jest.spyOn(pollRepository, 'findAndCount').mockResolvedValue([polls, count]);

    const result = await pollService.findAllPolls({ page: 1, limit: 10 });

    expect(result).toEqual({
      data: polls,
      total: count,
      page: 1,
      pageCount: 0,
    });
  });

  it('should get own polls', async () => {
    const polls = [new PollEntity()];
    const count = 1;
    jest.spyOn(pollRepository, 'findAndCount').mockResolvedValue([polls, count]);

    const result = await pollService.findOwnPolls({ page: 1, limit: 10, user: decodedUser });

    expect(result).toEqual({
      data: polls,
      total: count,
      page: 1,
      pageCount: 1,
    });
  });

  it('should get object with empty data array if no own polls', async () => {
    const polls = [];
    const count = 0;
    jest.spyOn(pollRepository, 'findAndCount').mockResolvedValue([polls, count]);

    const result = await pollService.findOwnPolls({ page: 1, limit: 10, user: decodedUser });

    expect(result).toEqual({
      data: polls,
      total: count,
      page: 1,
      pageCount: 0,
    });
  });

  it('should get poll', async () => {
    jest.spyOn(pollRepository, 'findOne').mockResolvedValue(poll);

    const result = await pollService.findPoll(pollId);

    expect(result).toEqual(poll);
  });

  it('should create new poll, create initial statistics and return created poll', async () => {
    mockEntityManager.create.mockReturnValue(poll);
    mockEntityManager.save.mockResolvedValue(poll);
    jest.spyOn(checkExists, 'validatePollExists').mockResolvedValue(fullPoll);
    pollRepository.manager.transaction = jest.fn().mockImplementation(cb => cb(mockEntityManager) as EntityManager);
    const createPollStatisticsMock = jest
      .spyOn(pollStatisticsService, 'createPollStatistics')
      .mockResolvedValue(undefined);

    const result = await pollService.createPoll({ pollDto, user: decodedUser });

    expect(jest.spyOn(pollRepository.manager, 'transaction')).toHaveBeenCalled();
    expect(mockEntityManager.create).toHaveBeenCalledWith(PollEntity, {
      ...pollDto,
      author: { id: decodedUser.userId },
    });
    expect(mockEntityManager.save).toHaveBeenCalledWith(PollEntity, poll);
    expect(createPollStatisticsMock).toHaveBeenCalledWith({
      answers: fullPoll.questions.flatMap(question => question.answers),
      pollId: pollId,
      entityManager: mockEntityManager,
    });
    expect(result).toEqual(fullPoll);
  });

  it('should delete poll', async () => {
    const mockResult = { message: 'Poll deleted successfully.' };
    jest.spyOn(checkExists, 'validatePollExists').mockResolvedValue(fullPoll);
    jest.spyOn(checkExists, 'validateUserExists').mockResolvedValue(new UserEntity());
    pollRepository.manager.transaction = jest.fn().mockImplementation(cb => cb(mockEntityManager) as EntityManager);

    const result = await pollService.deletePoll({ pollId, user: decodedUser });

    expect(jest.spyOn(pollRepository.manager, 'transaction')).toHaveBeenCalled();
    expect(mockEntityManager.delete).toHaveBeenCalledWith(PollEntity, { id: pollId });
    expect(result).toEqual(mockResult);
  });

  it('should change poll status to CLOSED', async () => {
    jest.spyOn(checkExists, 'validatePollExists').mockResolvedValue(poll);
    pollRepository.manager.findOne = jest.fn().mockResolvedValue(poll);
    pollRepository.manager.update = jest.fn();

    const result = await pollService.closePoll({ pollId, user: decodedUser, newStatus: PollStatus.CLOSED });

    expect(jest.spyOn(pollRepository.manager, 'update')).toHaveBeenCalledWith(
      PollEntity,
      { id: pollId },
      { status: PollStatus.CLOSED, closedAt: expect.any(Date) as Date },
    );
    expect(jest.spyOn(pollRepository.manager, 'findOne')).toHaveBeenCalledWith(PollEntity, {
      where: { id: pollId },
      relations: ['questions', 'questions.answers'],
    });
    expect(result).toEqual(poll);
  });

  it('should throw error if new status and current poll status are the same', async () => {
    poll.status = PollStatus.CLOSED;
    jest.spyOn(checkExists, 'validatePollExists').mockResolvedValue(poll);
    pollRepository.manager.findOne = jest.fn().mockResolvedValue(poll);
    pollRepository.manager.update = jest.fn();

    await expect(pollService.closePoll({ pollId, user: decodedUser, newStatus: PollStatus.CLOSED })).rejects.toThrow(
      new BadRequestException('Poll is already in this status.'),
    );
  });

  it('should update poll and return updated poll', async () => {
    mockEntityManager.create.mockReturnValue(poll);
    mockEntityManager.save.mockResolvedValue(poll);
    mockEntityManager.findOne.mockResolvedValue(fullPoll);
    jest.spyOn(checkExists, 'validateUserExists').mockResolvedValue(user);
    jest.spyOn(checkExists, 'validatePollExists').mockResolvedValue(fullPoll);
    jest.spyOn(checkExists, 'validateAnyoneAnswered').mockResolvedValue(undefined);
    jest.spyOn(pollService, 'updateQuestionsAndAnswers').mockResolvedValue(undefined);
    pollRepository.manager.transaction = jest.fn().mockImplementation(cb => cb(mockEntityManager) as EntityManager);

    const result = await pollService.updatePoll({ pollId, pollUpdateDto, user: decodedUser });

    expect(jest.spyOn(pollRepository.manager, 'transaction')).toHaveBeenCalled();
    expect(mockEntityManager.save).toHaveBeenCalledWith(PollEntity, fullPoll);
    expect(mockEntityManager.findOne).toHaveBeenCalledWith(PollEntity, {
      where: { id: fullPoll.id },
      relations: ['questions', 'questions.answers'],
    });

    expect(result).toEqual(fullPoll);
  });

  it('should throw error if anyone answered this poll', async () => {
    jest.spyOn(checkExists, 'validateUserExists').mockResolvedValue(user);
    jest.spyOn(checkExists, 'validatePollExists').mockResolvedValue(fullPoll);
    jest
      .spyOn(checkExists, 'validateAnyoneAnswered')
      .mockRejectedValue(new BadRequestException('You cant update this poll. Someone has already answered this poll.'));
    pollRepository.manager.transaction = jest.fn().mockImplementation(cb => cb(mockEntityManager) as EntityManager);

    await expect(pollService.updatePoll({ pollId, pollUpdateDto, user: decodedUser })).rejects.toThrow(
      new BadRequestException('You cant update this poll. Someone has already answered this poll.'),
    );
  });

  it('should update questions and answers', async () => {
    pollRepository.manager.remove = jest.fn();
    const newQuestionIds = pollUpdateDto.questions?.map(q => q.id).filter(id => id !== undefined);
    const questionsToDelete = fullPoll.questions.filter(q => !newQuestionIds?.includes(q.id));
    const question = fullPoll.questions.find(q => q.id === pollUpdateDto.questions?.[0].id);
    const questionDto = pollUpdateDto.questions?.[0];
    const newAnswerIds = questionDto?.answers?.map(a => a.id).filter(id => id !== undefined);
    const answersToDelete = question?.answers.filter(a => !newAnswerIds?.includes(a.id));

    await pollService.updateQuestionsAndAnswers({
      poll: fullPoll,
      pollUpdateDto,
      entityManager: pollRepository.manager,
    });

    expect(jest.spyOn(pollRepository.manager, 'remove')).toHaveBeenCalledWith(QuestionEntity, questionsToDelete);
    expect(jest.spyOn(pollRepository.manager, 'remove')).toHaveBeenCalledWith(AnswerEntity, answersToDelete);
  });

  it('should save answers for poll and return poll statistics', async () => {
    const answers = userAnswersDto.userAnswers.map(answer => {
      return {
        user: { id: decodedUser.userId },
        question: { id: answer.questionId },
        answer: { id: answer.answerId },
        poll: { id: pollId },
      } as UserAnswerEntity;
    });

    mockEntityManager.save.mockResolvedValue(undefined);
    jest.spyOn(checkExists, 'validateUserExists').mockResolvedValue(user);
    jest.spyOn(checkExists, 'validatePollExists').mockResolvedValue(fullPoll);
    jest.spyOn(checkExists, 'validatePollAnswered').mockResolvedValue(undefined);
    jest.spyOn(pollService, 'createUserAnswers').mockResolvedValue(answers);
    jest.spyOn(pollStatisticsService, 'getPollStatistics').mockResolvedValue(pollStatistics);
    pollRepository.manager.transaction = jest.fn().mockImplementation(cb => cb(mockEntityManager) as EntityManager);
    const updatePollStatisticsMock = jest
      .spyOn(pollStatisticsService, 'updatePollStatistics')
      .mockResolvedValue(undefined);

    const result = await pollService.saveAnswers({ userAnswersDto, user: decodedUser, pollId });

    expect(jest.spyOn(pollRepository.manager, 'transaction')).toHaveBeenCalled();
    expect(updatePollStatisticsMock).toHaveBeenCalledWith({
      answers,
      pollId,
      entityManager: mockEntityManager,
    });
    expect(result).toEqual(pollStatistics);
  });

  it('should throw error if user not found when saving answers', async () => {
    jest.spyOn(checkExists, 'validateUserExists').mockRejectedValue(new NotFoundException('User not found.'));
    jest.spyOn(checkExists, 'validatePollExists').mockResolvedValue(fullPoll);
    pollRepository.manager.transaction = jest.fn().mockImplementation(cb => cb(mockEntityManager) as EntityManager);

    await expect(pollService.saveAnswers({ userAnswersDto, user: decodedUser, pollId })).rejects.toThrow(
      new NotFoundException('User not found.'),
    );
  });

  it('should throw error if poll not found when saving answers', async () => {
    jest.spyOn(checkExists, 'validateUserExists').mockResolvedValue(user);
    jest.spyOn(checkExists, 'validatePollExists').mockRejectedValue(new NotFoundException('Poll not found.'));
    pollRepository.manager.transaction = jest.fn().mockImplementation(cb => cb(mockEntityManager) as EntityManager);

    await expect(pollService.saveAnswers({ userAnswersDto, user: decodedUser, pollId })).rejects.toThrow(
      new NotFoundException('Poll not found.'),
    );
  });

  it('should throw error if you already answered poll', async () => {
    jest.spyOn(checkExists, 'validateUserExists').mockResolvedValue(user);
    jest.spyOn(checkExists, 'validatePollExists').mockResolvedValue(fullPoll);
    jest
      .spyOn(checkExists, 'validatePollAnswered')
      .mockRejectedValue(new BadRequestException('You have already answered this poll.'));
    pollRepository.manager.transaction = jest.fn().mockImplementation(cb => cb(mockEntityManager) as EntityManager);

    await expect(pollService.saveAnswers({ userAnswersDto, user: decodedUser, pollId })).rejects.toThrow(
      new BadRequestException('You have already answered this poll.'),
    );
  });
});

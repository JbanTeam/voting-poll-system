import * as request from 'supertest';
import { Request } from 'express';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ExecutionContext } from '@nestjs/common';

import { UserService } from '@modules/user/user.service';
import { UserAnswerDto } from '@modules/user-answer/dto/user-answer.dto';
import { PollStatisticsService } from '@modules/poll-statistics/poll-statistics.service';
import { PollController } from '@modules/poll/poll.controller';
import { PollService } from '@modules/poll/poll.service';
import { PollDto } from '@modules/poll/dto/poll.dto';
import { PollUpdateDto } from '@modules/poll/dto/poll-update.dto';
import { PollEntity, PollStatus } from '@modules/poll/poll.entity';
import { DecodedUser, PollsByPage, PollStatistics } from '@src/types/types';

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
      text: 'Updated Question',
      answers: [{ id: 1, text: 'Updated Answer' }, { text: 'New Answer' }],
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

describe('PollController', () => {
  let app: INestApplication;
  let pollService: PollService;
  let pollStatisticsService: PollStatisticsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PollController],
      providers: [
        {
          provide: PollService,
          useValue: {
            findAllPolls: jest.fn(),
            findOwnPolls: jest.fn(),
            createPoll: jest.fn(),
            saveAnswers: jest.fn(),
            closePoll: jest.fn(),
            updatePoll: jest.fn(),
            deletePoll: jest.fn(),
          },
        },
        {
          provide: PollStatisticsService,
          useValue: {
            getPollStatistics: jest.fn(),
          },
        },
        {
          provide: UserService,
          useValue: {
            findByEmail: jest.fn(),
            create: jest.fn(),
            updateRefreshToken: jest.fn().mockResolvedValue(null),
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
  });

  afterEach(async () => {
    await app.close();
  });

  it('should get all polls', async () => {
    const result: PollsByPage = {
      data: [new PollEntity()],
      total: 1,
      page: 1,
      pageCount: 1,
    };
    jest.spyOn(pollService, 'findAllPolls').mockResolvedValue(result);

    const response = await request(app.getHttpServer()).get('/polls').query({ page: 1, limit: 10 });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(result);
  });

  it('should get own polls', async () => {
    const result: PollsByPage = {
      data: [new PollEntity()],
      total: 1,
      page: 1,
      pageCount: 1,
    };
    const page = 1;
    const limit = 10;

    const findOwnPollsMock = jest.spyOn(pollService, 'findOwnPolls').mockResolvedValue(result);

    const response = await request(app.getHttpServer()).get('/polls/own').query({ page, limit });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(result);
    expect(findOwnPollsMock).toHaveBeenCalledWith({ page, limit, user: decodedUser });
  });

  it('should get poll statistics', async () => {
    const getPollStatisticsMock = jest
      .spyOn(pollStatisticsService, 'getPollStatistics')
      .mockResolvedValue(pollStatistics);

    const response = await request(app.getHttpServer()).get(`/polls/${pollId}/statistics`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(pollStatistics);
    expect(getPollStatisticsMock).toHaveBeenCalledWith({ pollId });
  });

  it('should create new poll and return created poll', async () => {
    const createPollMock = jest.spyOn(pollService, 'createPoll').mockResolvedValue(poll);

    const response = await request(app.getHttpServer()).post(`/polls`).send(pollDto);

    expect(response.status).toBe(201);
    expect(response.body).toEqual(poll);
    expect(createPollMock).toHaveBeenCalledWith({ pollDto, user: decodedUser });
  });

  it('should save answers for poll and return poll statistics', async () => {
    const saveAnswersMock = jest.spyOn(pollService, 'saveAnswers').mockResolvedValue(pollStatistics);

    const response = await request(app.getHttpServer()).post(`/polls/${pollId}/save-answers`).send(userAnswersDto);

    expect(response.status).toBe(201);
    expect(response.body).toEqual(pollStatistics);
    expect(saveAnswersMock).toHaveBeenCalledWith({ pollId, user: decodedUser, userAnswersDto });
  });

  it('should change poll status to CLOSED and return updated poll', async () => {
    poll.status = PollStatus.CLOSED;
    const closePollMock = jest.spyOn(pollService, 'closePoll').mockResolvedValue(poll);

    const response = await request(app.getHttpServer()).patch(`/polls/${pollId}/close`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(poll);
    expect(closePollMock).toHaveBeenCalledWith({ pollId, user: decodedUser, newStatus: PollStatus.CLOSED });
  });

  it('should update poll and return updated poll', async () => {
    const updatePollMock = jest.spyOn(pollService, 'updatePoll').mockResolvedValue(fullPoll);

    const response = await request(app.getHttpServer()).patch(`/polls/${pollId}/update`).send(pollUpdateDto);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(fullPoll);
    expect(updatePollMock).toHaveBeenCalledWith({ pollId, user: decodedUser, pollUpdateDto });
  });

  it('should delete poll and return success message', async () => {
    const result = { message: 'Poll deleted successfully.' };
    const deletePollMock = jest.spyOn(pollService, 'deletePoll').mockResolvedValue(result);

    const response = await request(app.getHttpServer()).delete(`/polls/${pollId}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(result);
    expect(deletePollMock).toHaveBeenCalledWith({ pollId, user: decodedUser });
  });
});

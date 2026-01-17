import * as path from 'path';
import * as request from 'supertest';
import { Repository } from 'typeorm';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';

import { UserEntity } from '@modules/user/user.entity';
import { AuthModule } from '@modules/auth/auth.module';
import { RegisterDto } from '@modules/auth/dto/register.dto';
import { PollDto } from '@modules/poll/dto/poll.dto';
import { PollModule } from '@modules/poll/poll.module';
import { PollEntity, PollStatus } from '@modules/poll/poll.entity';
import { PollStatisticsEntity } from '@modules/poll-statistics/poll-statistics.entity';
import { databaseConfig } from '@libs/config/database.config';
import { PollUpdateDto } from '@modules/poll/dto/poll-update.dto';
import { PollStatistics } from '@src/types/types';
import { UserAnswerDto } from '@modules/user-answer/dto/user-answer.dto';

const registerDto: RegisterDto = {
  name: 'Vital',
  email: 'vital@mail.ru',
  password: '11111111',
  confirmPassword: '11111111',
};

const pollDto = {
  title: 'Super poll',
  description: 'super description',
  questions: [
    {
      text: 'How old are you?',
      answers: [{ text: '11-20' }, { text: '21-30' }, { text: '31-40' }],
    },
    {
      text: 'How are you?',
      answers: [{ text: 'fine' }, { text: 'very well' }, { text: 'bad' }],
    },
  ],
} as PollDto;

const pollUpdateDto = {
  title: 'Updated Poll',
  questions: [
    {
      id: 1,
      text: 'Updated Question 1',
      answers: [{ id: 1, text: 'Updated Answer 1' }, { text: 'New Answer' }],
    },
  ],
} as PollUpdateDto;

const userAnswerDto = {
  userAnswers: [
    { questionId: 1, answerId: 1 },
    { questionId: 2, answerId: 4 },
  ],
} as UserAnswerDto;

describe('PollController (e2e)', () => {
  let app: INestApplication;
  let pollRepository: Repository<PollEntity>;
  let pollStatisticsRepository: Repository<PollStatisticsEntity>;
  let userRepository: Repository<UserEntity>;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          envFilePath: [path.resolve(__dirname, '..', '.env.test')],
          isGlobal: true,
        }),
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => databaseConfig(configService),
        }),
        AuthModule,
        PollModule,
      ],
    }).compile();

    app = module.createNestApplication();
    await app.init();

    userRepository = module.get<Repository<UserEntity>>(getRepositoryToken(UserEntity));
    pollRepository = module.get<Repository<PollEntity>>(getRepositoryToken(PollEntity));
    pollStatisticsRepository = module.get<Repository<PollStatisticsEntity>>(getRepositoryToken(PollStatisticsEntity));
  });

  afterAll(async () => {
    await userRepository.query('TRUNCATE TABLE "user" RESTART IDENTITY CASCADE;');
    await pollRepository.query('TRUNCATE TABLE "poll" RESTART IDENTITY CASCADE;');
    await pollStatisticsRepository.query('TRUNCATE TABLE "poll_statistics" RESTART IDENTITY CASCADE;');
    await app.close();
  });

  beforeEach(async () => {
    await userRepository.query('TRUNCATE TABLE "user" RESTART IDENTITY CASCADE;');
    await pollRepository.query('TRUNCATE TABLE "poll" RESTART IDENTITY CASCADE;');
    await pollStatisticsRepository.query('TRUNCATE TABLE "poll_statistics" RESTART IDENTITY CASCADE;');
  });

  describe('/polls (GET)', () => {
    it('should get all polls', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(HttpStatus.CREATED);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');

      await request(app.getHttpServer())
        .post('/polls')
        .set('Authorization', `Bearer ${response.body.accessToken}`)
        .send(pollDto);

      const polls = await request(app.getHttpServer())
        .get('/polls')
        .query({ page: 1, limit: 10 })
        .set('Authorization', `Bearer ${response.body.accessToken}`)
        .expect(HttpStatus.OK);

      expect(polls.body.data).toHaveLength(1);
    });
  });

  describe('/polls (GET)', () => {
    it('should get own polls', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(HttpStatus.CREATED);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');

      await request(app.getHttpServer())
        .post('/polls')
        .set('Authorization', `Bearer ${response.body.accessToken}`)
        .send(pollDto);

      const polls = await request(app.getHttpServer())
        .get('/polls/own')
        .query({ page: 1, limit: 10 })
        .set('Authorization', `Bearer ${response.body.accessToken}`)
        .expect(HttpStatus.OK);

      expect(polls.body.data).toHaveLength(1);
    });
  });

  describe('/polls/:pollId (GET)', () => {
    it('should get poll', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(HttpStatus.CREATED);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');

      const pollResponse = await request(app.getHttpServer())
        .post('/polls')
        .set('Authorization', `Bearer ${response.body.accessToken}`)
        .send(pollDto);

      const pollId = Number(pollResponse.body.id);

      const poll = await request(app.getHttpServer())
        .get(`/polls/${pollId}`)
        .set('Authorization', `Bearer ${response.body.accessToken}`)
        .expect(HttpStatus.OK);

      expect(poll.body.title).toEqual(pollDto.title);
    });
  });

  describe('/polls/:pollId/statistics (GET)', () => {
    it('should get poll statistics', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(HttpStatus.CREATED);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');

      const pollResponse = await request(app.getHttpServer())
        .post('/polls')
        .set('Authorization', `Bearer ${response.body.accessToken}`)
        .send(pollDto);

      const pollId = Number(pollResponse.body.id);

      const pollStatistics = await request(app.getHttpServer())
        .get(`/polls/${pollId}/statistics`)
        .set('Authorization', `Bearer ${response.body.accessToken}`)
        .expect(HttpStatus.OK);

      expect(Object.keys(pollStatistics.body)[0]).toEqual(`${pollId}`);
    });
  });

  describe('/polls (POST)', () => {
    it('should create new poll', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(HttpStatus.CREATED);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');

      const pollResponse = await request(app.getHttpServer())
        .post('/polls')
        .set('Authorization', `Bearer ${response.body.accessToken}`)
        .send(pollDto);

      const poll = await pollRepository.findOne({ where: { id: Number(pollResponse.body.id) } });

      expect(poll?.title).toEqual(pollDto.title);
    });
  });

  describe('/polls/:pollId/save-answers (POST)', () => {
    it('should save users answers and return poll statistics', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(HttpStatus.CREATED);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');

      const pollResponse = await request(app.getHttpServer())
        .post('/polls')
        .set('Authorization', `Bearer ${response.body.accessToken}`)
        .send(pollDto);

      const pollId = Number(pollResponse.body.id);

      const saveAnswersResponse = await request(app.getHttpServer())
        .post(`/polls/${pollResponse.body.id}/save-answers`)
        .set('Authorization', `Bearer ${response.body.accessToken}`)
        .send(userAnswerDto)
        .expect(HttpStatus.CREATED);

      const pollStatistics = saveAnswersResponse.body as PollStatistics;

      expect(Object.keys(pollStatistics)[0]).toEqual(`${pollId}`);
      expect(pollStatistics[`${pollId}`].stats[0].count).toEqual(1);
    });
  });

  describe('/polls/:pollId/close (PATCH)', () => {
    it('should change status of poll to CLOSED', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(HttpStatus.CREATED);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');

      const pollResponse = await request(app.getHttpServer())
        .post('/polls')
        .set('Authorization', `Bearer ${response.body.accessToken}`)
        .send(pollDto);

      const closePollResponse = await request(app.getHttpServer())
        .patch(`/polls/${pollResponse.body.id}/close`)
        .set('Authorization', `Bearer ${response.body.accessToken}`)
        .expect(HttpStatus.OK);

      expect(closePollResponse.body.status).toEqual(PollStatus.CLOSED);
    });
  });

  describe('/polls/:pollId/update (PATCH)', () => {
    it('should update poll', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(HttpStatus.CREATED);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');

      const pollResponse = await request(app.getHttpServer())
        .post('/polls')
        .set('Authorization', `Bearer ${response.body.accessToken}`)
        .send(pollDto);

      const updatePollResponse = await request(app.getHttpServer())
        .patch(`/polls/${pollResponse.body.id}/update`)
        .set('Authorization', `Bearer ${response.body.accessToken}`)
        .send(pollUpdateDto)
        .expect(HttpStatus.OK);

      expect(updatePollResponse.body.title).toEqual(pollUpdateDto.title);
    });
  });

  describe('/polls/:pollId (DELETE)', () => {
    it('should update poll', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(HttpStatus.CREATED);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');

      const pollResponse = await request(app.getHttpServer())
        .post('/polls')
        .set('Authorization', `Bearer ${response.body.accessToken}`)
        .send(pollDto);

      const deletePollResponse = await request(app.getHttpServer())
        .delete(`/polls/${pollResponse.body.id}`)
        .set('Authorization', `Bearer ${response.body.accessToken}`)
        .expect(HttpStatus.OK);

      expect(deletePollResponse.body.message).toEqual('Poll deleted successfully.');
    });
  });
});

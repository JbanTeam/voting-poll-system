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
import { databaseConfig } from '@src/config/database.config';

const registerDto: RegisterDto = {
  name: 'Vital',
  email: 'vital@mail.ru',
  password: '11111111',
  confirmPassword: '11111111',
};

describe('UserController (e2e)', () => {
  let app: INestApplication;
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
      ],
    }).compile();

    app = module.createNestApplication();
    await app.init();

    userRepository = module.get<Repository<UserEntity>>(getRepositoryToken(UserEntity));
  });

  afterAll(async () => {
    await userRepository.query('TRUNCATE TABLE "user" RESTART IDENTITY CASCADE;');
    await app.close();
  });

  beforeEach(async () => {
    await userRepository.query('TRUNCATE TABLE "user" RESTART IDENTITY CASCADE;');
  });

  describe('/users (GET)', () => {
    it('should get all users', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(HttpStatus.CREATED);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');

      const users = await request(app.getHttpServer()).get('/users').expect(HttpStatus.OK);
      expect(users.body).toHaveLength(1);

      expect(users.body[0].email).toEqual(registerDto.email);
    });
  });

  describe('/users/:id (GET)', () => {
    it('should get user by id', async () => {
      const userId = 1;
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(HttpStatus.CREATED);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');

      const user = await request(app.getHttpServer())
        .get(`/users/${userId}`)
        .set('Authorization', `Bearer ${response.body.accessToken}`)
        .expect(HttpStatus.OK);

      expect(user.body.email).toEqual(registerDto.email);
    });
  });
});

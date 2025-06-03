import * as path from 'path';
import * as request from 'supertest';
import { Repository } from 'typeorm';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';

import { UserEntity } from '@modules/user/user.entity';
import { AuthModule } from '@modules/auth/auth.module';
import { RegisterDto } from '@modules/auth/dto/register.dto';
import { LoginDto } from '@modules/auth/dto/login.dto';
import { databaseConfig } from '@src/config/database.config';

const registerDto: RegisterDto = {
  name: 'Vital',
  email: 'vital@mail.ru',
  password: '11111111',
  confirmPassword: '11111111',
};

const loginDto: LoginDto = {
  email: 'vital@mail.ru',
  password: '11111111',
};

describe('AuthController (e2e)', () => {
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

  describe('/auth/register (POST)', () => {
    it('should register a new user', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(HttpStatus.CREATED);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');

      const user = await userRepository.findOne({ where: { email: registerDto.email } });
      expect(user).toBeDefined();
      expect(user?.email).toEqual(registerDto.email);
    });
  });

  describe('/auth/login (POST)', () => {
    it('should login a user', async () => {
      await request(app.getHttpServer()).post('/auth/register').send(registerDto);

      const response = await request(app.getHttpServer()).post('/auth/login').send(loginDto).expect(HttpStatus.OK);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
    });
  });

  describe('/auth/logout (PATCH)', () => {
    it('should logout a user', async () => {
      await request(app.getHttpServer()).post('/auth/register').send(registerDto);

      const loginResponse = await request(app.getHttpServer()).post('/auth/login').send(loginDto);

      const accessToken = loginResponse.body.accessToken as string;

      const response = await request(app.getHttpServer())
        .patch('/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(HttpStatus.OK);

      expect(response.body).toEqual({ message: 'Logout successfully' });
    });
  });

  describe('/auth/refresh-token (POST)', () => {
    it('should refresh the token', async () => {
      await request(app.getHttpServer()).post('/auth/register').send(registerDto);

      const loginResponse = await request(app.getHttpServer()).post('/auth/login').send(loginDto);

      const refreshToken = loginResponse.body.refreshToken as string;

      const response = await request(app.getHttpServer())
        .post('/auth/refresh-token')
        .send({ refreshToken })
        .expect(HttpStatus.OK);

      expect(response.body).toHaveProperty('accessToken');
    });
  });
});

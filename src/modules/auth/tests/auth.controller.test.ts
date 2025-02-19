import * as request from 'supertest';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ExecutionContext } from '@nestjs/common';

import { AuthService } from '@modules/auth/auth.service';
import { AuthController } from '@modules/auth/auth.controller';
import { UserService } from '@modules/user/user.service';
import { HashService } from '@modules/auth/hash/hash.service';
import { RegisterDto } from '@modules/auth/dto/register.dto';
import { LoginDto } from '@modules/auth/dto/login.dto';

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

describe('AuthController', () => {
  let app: INestApplication;
  let authService: AuthService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn(),
            login: jest.fn(),
            logout: jest.fn().mockResolvedValue({ message: 'Logout successfully' }),
            refreshToken: jest.fn(),
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
          provide: HashService,
          useValue: {
            hash: jest.fn().mockResolvedValue('hashed-password'),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn().mockReturnValue('mock-token'),
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

    authService = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(async () => {
    await app.close();
  });

  it('should register a user and return tokens with status 201', async () => {
    const result = { accessToken: 'access-token', refreshToken: 'refresh-token' };

    jest.spyOn(authService, 'register').mockResolvedValue(result);

    const response = await request(app.getHttpServer()).post('/auth/register').send(registerDto);

    expect(response.status).toBe(201);
    expect(response.body).toEqual(result);
  });

  it('should login a user and return tokens with status 200', async () => {
    const result = { accessToken: 'access-token', refreshToken: 'refresh-token' };

    jest.spyOn(authService, 'login').mockResolvedValue(result);

    const response = await request(app.getHttpServer()).post('/auth/login').send(loginDto);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(result);
  });

  it('should logout a user and return status 200', async () => {
    const result = { message: 'Logout successfully' };
    const mockToken = await jwtService.signAsync({ userId: 1 });

    jest.spyOn(authService, 'logout').mockResolvedValue(result);

    const response = await request(app.getHttpServer())
      .patch('/auth/logout')
      .set('Authorization', `Bearer ${mockToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(result);
  });

  it('should refresh a token and return new access token with status 200', async () => {
    const result = { accessToken: 'access-token' };
    const mockToken = await jwtService.signAsync({ userId: 1 });

    jest.spyOn(authService, 'refreshToken').mockResolvedValue(result);

    const response = await request(app.getHttpServer()).post('/auth/refresh-token').send({ refreshToken: mockToken });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(result);
  });
});

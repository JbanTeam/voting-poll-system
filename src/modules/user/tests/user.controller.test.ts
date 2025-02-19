import * as request from 'supertest';
import { Request } from 'express';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ExecutionContext } from '@nestjs/common';

import { UserService } from '@modules/user/user.service';
import { UserController } from '@modules/user/user.controller';
import { UserEntity } from '@modules/user/user.entity';

const mockUsers = [new UserEntity(), new UserEntity()];
const mockUser = new UserEntity();
mockUser.id = 1;
const userId = 1;

describe('UserController', () => {
  let app: INestApplication;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            findAll: jest.fn(),
            findById: jest.fn(),
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

    userService = module.get<UserService>(UserService);
  });

  afterEach(async () => {
    await app.close();
  });

  it('should find all users', async () => {
    jest.spyOn(userService, 'findAll').mockResolvedValue(mockUsers);

    const response = await request(app.getHttpServer()).get('/users');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockUsers);
  });

  it('should find user by id', async () => {
    jest.spyOn(userService, 'findById').mockResolvedValue(mockUser);

    const response = await request(app.getHttpServer()).get(`/users/${userId}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockUser);
  });
});

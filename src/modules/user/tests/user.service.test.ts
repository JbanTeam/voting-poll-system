import { Request } from 'express';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { createMock } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ExecutionContext } from '@nestjs/common';

import { RegisterDto } from '@modules/auth/dto/register.dto';
import { UserService } from '@modules/user/user.service';
import { UserController } from '@modules/user/user.controller';
import { UserEntity } from '@modules/user/user.entity';

const mockUsers = [new UserEntity(), new UserEntity()];

const mockUser = new UserEntity();
mockUser.id = 1;
mockUser.email = 'vital@mail.ru';

const userId = 1;

const registerDto: RegisterDto = {
  name: 'Vital',
  email: 'vital@mail.ru',
  password: '11111111',
  confirmPassword: '11111111',
};

describe('UserService', () => {
  let app: INestApplication;
  let userService: UserService;
  let userRepository: Repository<UserEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        UserService,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: createMock<Repository<UserEntity>>(),
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
    userRepository = module.get<Repository<UserEntity>>(getRepositoryToken(UserEntity));
  });

  afterEach(async () => {
    await app.close();
  });

  it('should find all users', async () => {
    jest.spyOn(userRepository, 'find').mockResolvedValue(mockUsers);

    const result = await userService.findAll();

    expect(result).toEqual(mockUsers);
  });

  it('should find user by id', async () => {
    jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);

    const result = await userService.findById(userId);

    expect(jest.spyOn(userRepository, 'findOne')).toHaveBeenCalledWith({ where: { id: userId } });
    expect(result).toEqual(mockUser);
  });

  it('should find user by email', async () => {
    jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);

    const result = await userService.findByEmail(mockUser.email);

    expect(jest.spyOn(userRepository, 'findOne')).toHaveBeenCalledWith({ where: { email: mockUser.email } });
    expect(result).toEqual(mockUser);
  });

  it('should create new user', async () => {
    userRepository.create = jest.fn().mockReturnValue(mockUser);
    jest.spyOn(userRepository, 'save').mockResolvedValue(mockUser);

    const result = await userService.create(registerDto);

    expect(jest.spyOn(userRepository, 'create')).toHaveBeenCalledWith(registerDto);
    expect(jest.spyOn(userRepository, 'save')).toHaveBeenCalledWith(mockUser);
    expect(result).toEqual(mockUser);
  });

  it('should update refresh token', async () => {
    await userService.updateRefreshToken({ userId, refreshToken: 'refresh-token' });

    expect(jest.spyOn(userRepository, 'update')).toHaveBeenCalledWith(
      { id: userId },
      { refreshToken: 'refresh-token' },
    );
  });
});

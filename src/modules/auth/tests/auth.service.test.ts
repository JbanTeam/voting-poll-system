import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';

import { RegisterDto } from '@modules/auth/dto/register.dto';
import { LoginDto } from '@modules/auth/dto/login.dto';
import { AuthService } from '@modules/auth/auth.service';
import { UserService } from '@modules/user/user.service';
import { HashService } from '@modules/auth/hash/hash.service';
import { UserEntity } from '@modules/user/user.entity';

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

const mockUser = new UserEntity();
mockUser.email = 'vital@mail.ru';
mockUser.id = 1;
mockUser.refreshToken = 'refresh-token';

describe('AuthService', () => {
  let authService: AuthService;
  let userService: UserService;
  let hashService: HashService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: {
            findByEmail: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
            updateRefreshToken: jest.fn(),
          },
        },
        {
          provide: HashService,
          useValue: {
            hash: jest.fn().mockResolvedValue('hashed-password'),
            compare: jest.fn().mockResolvedValue(true),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn().mockReturnValue('mock-token'),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    hashService = module.get<HashService>(HashService);
  });

  it('should throw an error if user already exists', async () => {
    jest.spyOn(userService, 'findByEmail').mockResolvedValue(mockUser);
    await expect(authService.register(registerDto)).rejects.toThrow(BadRequestException);
  });

  it('should register a new user and return tokens', async () => {
    jest.spyOn(userService, 'findByEmail').mockResolvedValue(null);
    jest.spyOn(userService, 'create').mockResolvedValue(new UserEntity());
    jest
      .spyOn(authService, 'generateTokens')
      .mockResolvedValue({ accessToken: 'access-token', refreshToken: 'refresh-token' });
    jest.spyOn(userService, 'updateRefreshToken').mockResolvedValue(undefined);

    const result = await authService.register(registerDto);
    expect(result).toEqual({ accessToken: 'access-token', refreshToken: 'refresh-token' });
  });

  it('should throw an error if user not exists', async () => {
    jest.spyOn(userService, 'findByEmail').mockResolvedValue(null);
    await expect(authService.login(loginDto)).rejects.toThrow(BadRequestException);
  });

  it('should throw an error if password is incorrect', async () => {
    jest.spyOn(userService, 'findByEmail').mockResolvedValue(mockUser);
    jest.spyOn(hashService, 'compare').mockResolvedValue(false);
    await expect(authService.login(loginDto)).rejects.toThrow(BadRequestException);
  });

  it('should login a user and return tokens', async () => {
    jest.spyOn(userService, 'findByEmail').mockResolvedValue(mockUser);
    jest.spyOn(hashService, 'compare').mockResolvedValue(true);
    jest
      .spyOn(authService, 'generateTokens')
      .mockResolvedValue({ accessToken: 'access-token', refreshToken: 'refresh-token' });
    jest.spyOn(userService, 'updateRefreshToken').mockResolvedValue(undefined);

    const result = await authService.login(loginDto);
    expect(result).toEqual({ accessToken: 'access-token', refreshToken: 'refresh-token' });
  });

  it('should throw error if user is not logged in', async () => {
    const userId = 1;
    jest.spyOn(userService, 'findById').mockResolvedValue(null);

    await expect(authService.logout(userId)).rejects.toThrow(BadRequestException);
    await expect(authService.logout(userId)).rejects.toThrow('You are not logged in');
  });

  it('should throw error if refresh token is invalid', async () => {
    const userId = 1;
    mockUser.refreshToken = 'invalid-token';
    jest.spyOn(userService, 'findById').mockResolvedValue(mockUser);
    jest.spyOn(authService, 'verifyRefreshToken').mockImplementation(() => {
      throw new BadRequestException('Invalid refresh token');
    });

    await expect(authService.logout(userId)).rejects.toThrow(BadRequestException);
    await expect(authService.logout(userId)).rejects.toThrow('Invalid refresh token');
  });

  it('should logout a user successfully', async () => {
    const userId = 1;
    jest.spyOn(userService, 'findById').mockResolvedValue(mockUser);
    jest.spyOn(authService, 'verifyRefreshToken').mockResolvedValue({ userId: 1 });
    const updateRefreshTokenMock = jest.spyOn(userService, 'updateRefreshToken').mockResolvedValue(undefined);

    const result = await authService.logout(userId);
    expect(result).toEqual({ message: 'Logout successfully' });
    expect(updateRefreshTokenMock).toHaveBeenCalledWith({
      userId,
      refreshToken: null,
    });
  });
});

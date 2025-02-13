import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { UserService } from '../user/user.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { HashService } from './hash/hash.service';
import { DecodedUser } from 'src/types/types';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private hashService: HashService,
  ) {}

  async register(registerDto: RegisterDto): Promise<{ accessToken: string; refreshToken: string }> {
    const existingUser = await this.userService.findByEmail(registerDto.email);

    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    registerDto.password = await this.hashService.hash(registerDto.password);

    const user = await this.userService.create(registerDto);

    const { accessToken, refreshToken } = await this.generateTokens(user.id);

    await this.userService.updateRefreshToken({ userId: user.id, refreshToken });
    return { accessToken, refreshToken };
  }

  async login(loginDto: LoginDto): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await this.userService.findByEmail(loginDto.email);
    if (!user) {
      throw new BadRequestException('Invalid credentials');
    }
    const isPasswordValid = await this.hashService.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('Invalid credentials');
    }

    const { accessToken, refreshToken } = await this.generateTokens(user.id);

    await this.userService.updateRefreshToken({ userId: user.id, refreshToken });
    return { accessToken, refreshToken };
  }

  async logout(userId: number): Promise<void> {
    await this.userService.updateRefreshToken({ userId, refreshToken: null });
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    const { userId }: DecodedUser = await this.jwtService.verifyAsync(refreshToken, {
      secret: process.env.JWT_REFRESH_SECRET || 'secret',
    });
    const user = await this.userService.findById(userId);

    if (!user || user.refreshToken !== refreshToken) {
      throw new BadRequestException('Invalid refresh token');
    }

    const accessToken = await this.jwtService.signAsync({ userId: user.id });

    return { accessToken };
  }

  async generateTokens(userId: number): Promise<{ accessToken: string; refreshToken: string }> {
    const accessToken = await this.jwtService.signAsync({ userId });
    const refreshToken = await this.jwtService.signAsync(
      { userId },
      { secret: process.env.JWT_REFRESH_SECRET || 'secret', expiresIn: '7 days' },
    );
    return { accessToken, refreshToken };
  }
}

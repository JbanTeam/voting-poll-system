import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { RegisterDto } from '../auth/dto/register.dto';
import { UserEntity } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
  ) {}

  async findAll(): Promise<UserEntity[]> {
    return this.usersRepository.find({
      relations: {
        polls: true,
      },
    });
  }
  async create(registerDto: RegisterDto): Promise<UserEntity> {
    const user = this.usersRepository.create(registerDto);
    return this.usersRepository.save(user);
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findById(id: number): Promise<UserEntity | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async updateRefreshToken({ userId, refreshToken }: { userId: number; refreshToken: string | null }): Promise<void> {
    await this.usersRepository.update({ id: userId }, { refreshToken });
  }
}

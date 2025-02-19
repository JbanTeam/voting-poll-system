import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { UserEntity } from './user.entity';
import { RegisterDto } from '@modules/auth/dto/register.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async findAll(): Promise<UserEntity[]> {
    return this.userRepository.find({
      relations: {
        polls: true,
      },
    });
  }
  async create(registerDto: RegisterDto): Promise<UserEntity> {
    const user = this.userRepository.create(registerDto);
    return this.userRepository.save(user);
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findById(id: number): Promise<UserEntity | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async updateRefreshToken({ userId, refreshToken }: { userId: number; refreshToken: string | null }): Promise<void> {
    await this.userRepository.update({ id: userId }, { refreshToken });
  }
}

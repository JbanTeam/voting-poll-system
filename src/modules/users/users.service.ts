import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { RegisterDto } from '../auth/dto/register.dto';
import { UsersEntity } from './users.entity';

@Injectable()
export class UsersService {
  constructor(private usersRepository: UsersRepository) {}

  async findAll(): Promise<UsersEntity[]> {
    return this.usersRepository.findAll();
  }
  async create(registerDto: RegisterDto): Promise<UsersEntity> {
    return this.usersRepository.createUser(registerDto);
  }

  async findUserByEmail(email: string): Promise<UsersEntity | null> {
    return this.usersRepository.findByEmail(email);
  }
  async findUserById(id: number): Promise<UsersEntity | null> {
    return this.usersRepository.findById(id);
  }
}

import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersEntity } from './users.entity';
import { RegisterDto } from '../auth/dto/register.dto';
import { LoginDto } from '../auth/dto/login.dto';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(UsersEntity)
    private readonly repository: Repository<UsersEntity>,
  ) {}

  async findAll(): Promise<UsersEntity[]> {
    return this.repository.find();
  }
  async createUser(registerDto: RegisterDto): Promise<UsersEntity> {
    const user = this.repository.create(registerDto);
    return this.repository.save(user);
  }

  async findByCredentials(loginDto: LoginDto): Promise<UsersEntity | null> {
    return this.repository.findOne({ where: { email: loginDto.email } });
  }

  async findByEmail(email: string): Promise<UsersEntity | null> {
    return this.repository.findOne({ where: { email } });
  }

  async findById(id: number): Promise<UsersEntity | null> {
    return this.repository.findOne({ where: { id } });
  }
}

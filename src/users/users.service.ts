import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { RegisterDto } from '../auth/dto/register.dto';

@Injectable()
export class UsersService {
  constructor(private usersRepository: UsersRepository) {}

  async findAll() {
    return this.usersRepository.findAll();
  }
  async create(registerDto: RegisterDto) {
    return this.usersRepository.createUser(registerDto);
  }

  async findUserByEmail(email: string) {
    return this.usersRepository.findByEmail(email);
  }
  async findUserById(id: number) {
    return this.usersRepository.findById(id);
  }
}

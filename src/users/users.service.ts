import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { RegisterDto } from '../auth/dto/register.dto';
import { LoginDto } from '../auth/dto/login.dto';

@Injectable()
export class UsersService {
  constructor(private usersRepository: UsersRepository) {}

  async create(registerDto: RegisterDto) {
    return this.usersRepository.createUser(registerDto);
  }

  async validateUser(loginDto: LoginDto) {
    return this.usersRepository.findByCredentials(loginDto);
  }
  async findUserByEmail(email: string) {
    return this.usersRepository.findByEmail(email);
  }
  async findUserById(id: number) {
    return this.usersRepository.findById(id);
  }
}

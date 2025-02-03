import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { HashService } from './hash/hash.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private hashService: HashService,
  ) {}

  async register(registerDto: RegisterDto): Promise<{ token: string }> {
    registerDto.password = await this.hashService.hash(registerDto.password);
    const user = await this.usersService.create(registerDto);

    return { token: this.jwtService.sign({ userId: user.id }) };
  }

  async login(loginDto: LoginDto): Promise<{ token: string }> {
    const user = await this.usersService.findUserByEmail(loginDto.email);
    if (!user) {
      throw new BadRequestException('Invalid credentials');
    }
    const isPasswordValid = await this.hashService.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('Invalid credentials');
    }

    return { token: this.jwtService.sign({ userId: user.id }) };
  }
}

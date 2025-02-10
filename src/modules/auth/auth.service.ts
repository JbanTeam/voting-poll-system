import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { UserService } from '../user/user.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { HashService } from './hash/hash.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private jwtService: JwtService,
    private hashService: HashService,
  ) {}

  async register(registerDto: RegisterDto): Promise<{ token: string }> {
    const existingUser = await this.usersService.findByEmail(registerDto.email);

    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    registerDto.password = await this.hashService.hash(registerDto.password);
    const user = await this.usersService.create(registerDto);

    return { token: this.jwtService.sign({ userId: user.id }) };
  }

  async login(loginDto: LoginDto): Promise<{ token: string }> {
    const user = await this.usersService.findByEmail(loginDto.email);
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

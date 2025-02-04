import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PollsEntity } from './polls.entity';
import { PollsDto } from './dto/polls.dto';
import { DecodedUser, PollsByPage } from 'src/types/types';

@Injectable()
export class PollsRepository {
  constructor(
    @InjectRepository(PollsEntity)
    private readonly repository: Repository<PollsEntity>,
  ) {}

  async findAll(page: number, limit: number): Promise<PollsByPage> {
    const [polls, count] = await this.repository.findAndCount({
      select: ['title', 'description', 'createdAt'],
      take: limit,
      skip: (page - 1) * limit,
    });

    return {
      data: polls,
      total: count,
      page,
      pageCount: Math.ceil(count / limit),
    };
  }
  async create(pollsDto: PollsDto, user: DecodedUser): Promise<PollsEntity> {
    const poll = this.repository.create({ ...pollsDto, author: { id: user.userId } });
    return await this.repository.save(poll);
  }

  async deleteAll() {
    return await this.repository.delete({});
  }

  async findById(id: number): Promise<PollsEntity | null> {
    return this.repository.findOne({ where: { id } });
  }
}

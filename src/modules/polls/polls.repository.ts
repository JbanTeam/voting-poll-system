import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PollsEntity } from './polls.entity';
import { PollsDto } from './dto/polls.dto';

@Injectable()
export class PollsRepository {
  constructor(
    @InjectRepository(PollsEntity)
    private readonly repository: Repository<PollsEntity>,
  ) {}

  async findAll(): Promise<PollsEntity[]> {
    return this.repository.find();
  }
  async create(pollsDto: PollsDto): Promise<PollsEntity> {
    const poll = this.repository.create(pollsDto);
    return this.repository.save(poll);
  }

  async findById(id: number): Promise<PollsEntity | null> {
    return this.repository.findOne({ where: { id } });
  }
}

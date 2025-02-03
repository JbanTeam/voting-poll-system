import { Injectable } from '@nestjs/common';
import { PollsRepository } from './polls.repository';
import { PollsDto } from './dto/polls.dto';
import { PollsEntity } from './polls.entity';

@Injectable()
export class PollsService {
  constructor(private pollsRepository: PollsRepository) {}

  async findAll(): Promise<PollsEntity[]> {
    return this.pollsRepository.findAll();
  }
  async create(pollsDto: PollsDto): Promise<PollsEntity> {
    return this.pollsRepository.create(pollsDto);
  }

  async findPollById(id: number): Promise<PollsEntity | null> {
    return this.pollsRepository.findById(id);
  }
}

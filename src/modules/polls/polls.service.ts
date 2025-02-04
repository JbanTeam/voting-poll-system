import { Injectable } from '@nestjs/common';
import { PollsRepository } from './polls.repository';
import { PollsDto } from './dto/polls.dto';
import { PollsEntity } from './polls.entity';
import { DecodedUser, PollsByPage } from 'src/types/types';

@Injectable()
export class PollsService {
  constructor(private pollsRepository: PollsRepository) {}

  async findAll(page: number, limit: number): Promise<PollsByPage> {
    return this.pollsRepository.findAll(page, limit);
  }
  async create(pollsDto: PollsDto, user: DecodedUser): Promise<PollsEntity> {
    return this.pollsRepository.create(pollsDto, user);
  }

  async deleteAll() {
    return this.pollsRepository.deleteAll();
  }

  async findPollById(id: number): Promise<PollsEntity | null> {
    return this.pollsRepository.findById(id);
  }
}

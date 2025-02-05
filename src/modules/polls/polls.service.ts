import { Injectable } from '@nestjs/common';
import { PollsDto } from './dto/polls.dto';
import { PollsEntity } from './polls.entity';
import { DecodedUser, PollsByPage } from 'src/types/types';
import { QuestionsEntity } from '../questions/questions.entity';
import { AnswersEntity } from '../answers/answers.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class PollsService {
  constructor(
    @InjectRepository(PollsEntity)
    private readonly pollsRepository: Repository<PollsEntity>,
    @InjectRepository(QuestionsEntity)
    private readonly questionsRepository: Repository<QuestionsEntity>,
    @InjectRepository(AnswersEntity)
    private readonly answersRepository: Repository<AnswersEntity>,
  ) {}

  async findAll(page: number, limit: number): Promise<PollsByPage> {
    const [polls, count] = await this.pollsRepository.findAndCount({
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
    const poll = this.pollsRepository.create({ ...pollsDto, author: { id: user.userId } });
    return await this.pollsRepository.save(poll);
  }

  async getAllQuestions(): Promise<QuestionsEntity[]> {
    return this.questionsRepository.find({ relations: ['poll', 'answers'] });
  }

  async getAllAnswers(): Promise<AnswersEntity[]> {
    return this.answersRepository.find({ relations: ['question'] });
  }

  async deleteAll() {
    return this.pollsRepository.delete({});
  }

  async findPollById(id: number): Promise<PollsEntity | null> {
    return this.pollsRepository.findOne({ where: { id } });
  }
}

import { InjectRepository } from '@nestjs/typeorm';
import { BadRequestException, Injectable } from '@nestjs/common';
import { EntityManager, Repository } from 'typeorm';

import { AnswerEntity } from '@modules/answer/answer.entity';
import { UserAnswerEntity } from '@modules/user-answer/user-answer.entity';
import { PollStatisticsEntity } from '@modules/poll-statistics/poll-statistics.entity';
import { PollStatistics } from '@src/types/types';

@Injectable()
export class PollStatisticService {
  constructor(
    @InjectRepository(PollStatisticsEntity)
    private readonly pollStatisticsRepository: Repository<PollStatisticsEntity>,
  ) {}

  async getPollStatistics({
    pollId,
    entityManager,
  }: {
    pollId: number;
    entityManager?: EntityManager;
  }): Promise<PollStatistics> {
    const manager = entityManager || this.pollStatisticsRepository.manager;
    const statistics = await manager.find(PollStatisticsEntity, {
      where: { poll: { id: pollId } },
      select: ['answer', 'count'],
      relations: ['poll', 'question', 'answer'],
      order: { count: 'DESC' },
    });

    const groupedStatistics = statistics.reduce<PollStatistics>((acc, stat) => {
      const questionId = stat.question.id;

      if (!acc[questionId]) {
        acc[questionId] = {
          title: stat.question.text,
          stats: [],
        };
      }

      acc[questionId].stats.push({
        count: stat.count,
        answer: {
          id: stat.answer.id,
          text: stat.answer.text,
        },
      });

      return acc;
    }, {});

    return groupedStatistics;
  }

  async createPollStatistics({
    answers,
    pollId,
    entityManager,
  }: {
    answers: AnswerEntity[];
    pollId: number;
    entityManager?: EntityManager;
  }) {
    const manager = entityManager || this.pollStatisticsRepository.manager;

    await manager
      .createQueryBuilder()
      .insert()
      .into('poll_statistics')
      .values(
        answers.map(answer => ({
          poll: { id: pollId },
          answer: { id: answer.id },
          question: { id: answer.question.id },
          count: 0,
        })),
      )
      .execute();
  }

  async updatePollStatistics({
    answers,
    pollId,
    entityManager,
  }: {
    answers: UserAnswerEntity[];
    pollId: number;
    entityManager?: EntityManager;
  }) {
    const manager = entityManager || this.pollStatisticsRepository.manager;
    const existingRecords = await manager
      .createQueryBuilder(PollStatisticsEntity, 'poll_statistics')
      .where('poll_id = :pollId AND answer_id IN (:...answerIds)', {
        pollId,
        answerIds: answers.map(userAnswer => userAnswer.answer.id),
      })
      .getMany();

    if (existingRecords.length !== answers.length) {
      throw new BadRequestException('Cant update statistics. Some records do not exist');
    }

    await manager
      .createQueryBuilder()
      .update('poll_statistics')
      .set({ count: () => 'count + 1' })
      .where('poll_id = :pollId AND answer_id IN (:...answerIds)', {
        pollId,
        answerIds: answers.map(userAnswer => userAnswer.answer.id),
      })
      .execute();
  }
}

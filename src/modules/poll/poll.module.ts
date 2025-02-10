import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PollService } from './poll.service';
import { PollController } from './poll.controller';
import { PollEntity } from './poll.entity';
import { QuestionEntity } from '../question/question.entity';
import { AnswerEntity } from '../answer/answer.entity';
import { UserAnswerEntity } from '../user-answer/user-answer.entity';
import { PollStatisticsEntity } from '../poll-statistics/poll-statistics.entity';
import { UserEntity } from '../user/user.entity';
import { PollStatisticService } from '../poll-statistics/poll-statistic.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PollEntity,
      QuestionEntity,
      AnswerEntity,
      UserAnswerEntity,
      PollStatisticsEntity,
      UserEntity,
    ]),
  ],
  controllers: [PollController],
  providers: [PollService, PollStatisticService],
  exports: [PollService],
})
export class PollModule {}

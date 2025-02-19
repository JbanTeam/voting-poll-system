import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PollService } from './poll.service';
import { PollController } from './poll.controller';
import { PollEntity } from './poll.entity';
import { UserEntity } from '@modules/user/user.entity';
import { QuestionEntity } from '@modules/question/question.entity';
import { AnswerEntity } from '@modules/answer/answer.entity';
import { UserAnswerEntity } from '@modules/user-answer/user-answer.entity';
import { PollStatisticsEntity } from '@modules/poll-statistics/poll-statistics.entity';
import { PollStatisticService } from '@modules/poll-statistics/poll-statistics.service';

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

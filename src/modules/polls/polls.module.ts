import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PollsService } from './polls.service';
import { PollsController } from './polls.controller';
import { PollsEntity } from './polls.entity';
import { QuestionsEntity } from '../questions/questions.entity';
import { AnswersEntity } from '../answers/answers.entity';
import { UserAnswersEntity } from '../user-answers/user-answers.entity';
import { PollStatisticsEntity } from '../poll-statistics/poll-statistics.entity';
import { UsersEntity } from '../users/users.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PollsEntity,
      QuestionsEntity,
      AnswersEntity,
      UserAnswersEntity,
      PollStatisticsEntity,
      UsersEntity,
    ]),
  ],
  controllers: [PollsController],
  providers: [PollsService],
  exports: [PollsService],
})
export class PollsModule {}

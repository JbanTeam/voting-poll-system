import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PollsService } from './polls.service';
import { PollsController } from './polls.controller';
import { PollsEntity } from './polls.entity';
import { PollsRepository } from './polls.repository';

@Module({
  imports: [TypeOrmModule.forFeature([PollsEntity])],
  controllers: [PollsController],
  providers: [PollsService, PollsRepository],
  exports: [PollsService, PollsRepository],
})
export class PollsModule {}

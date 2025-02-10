import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PollEntity, PollStatus } from 'src/modules/poll/poll.entity';
import { UserAnswer } from 'src/modules/user-answer/dto/user-answer.dto';
import { UserAnswerEntity } from 'src/modules/user-answer/user-answer.entity';
import { UserEntity } from 'src/modules/user/user.entity';
import { DecodedUser } from 'src/types/types';
import { EntityManager, In } from 'typeorm';

const validateUserExists = async (userId: number, manager: EntityManager) => {
  const user = await manager.findOne(UserEntity, {
    where: { id: userId },
  });
  if (!user) {
    throw new NotFoundException('User not found');
  }

  return user;
};

const validateNewStatus = (newStatus: PollStatus) => {
  if (newStatus !== PollStatus.CLOSED) {
    throw new BadRequestException('New status must be CLOSED');
  }
};

const validatePollExists = async (pollId: number, manager: EntityManager) => {
  const poll = await manager.findOne(PollEntity, {
    where: { id: pollId },
    relations: ['author'],
    select: { author: { id: true } },
  });
  if (!poll) {
    throw new NotFoundException('Poll not found');
  }

  return poll;
};

const validatePollAuthor = (poll: PollEntity, user: DecodedUser) => {
  if (poll.author.id !== user.userId) {
    throw new BadRequestException('You are not the author of this poll');
  }
};

const validatePollStatus = (pollStatus: PollStatus, newStatus: PollStatus) => {
  if (newStatus === pollStatus) {
    throw new BadRequestException('Poll is already in this status');
  }
};

const validateAnsweredQuestions = async (userId: number, userAnswers: UserAnswer[], entityManager: EntityManager) => {
  const questionIds = userAnswers.map(answer => answer.questionId);

  const existingAnswers = await entityManager.find(UserAnswerEntity, {
    where: {
      user: { id: userId },
      question: { id: In(questionIds) },
    },
  });

  if (existingAnswers.length > 0) {
    throw new BadRequestException('You have already answered this poll');
  }
  throw new BadRequestException('You have already answered this poll');
};

export {
  validateUserExists,
  validateNewStatus,
  validatePollExists,
  validatePollAuthor,
  validatePollStatus,
  validateAnsweredQuestions,
};

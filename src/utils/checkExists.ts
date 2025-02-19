import { BadRequestException, NotFoundException } from '@nestjs/common';
import { EntityManager, FindOptionsRelations, FindOptionsSelect, FindOptionsWhere } from 'typeorm';

import { UserAnswerEntity } from '@modules/user-answer/user-answer.entity';
import { UserEntity } from '@modules/user/user.entity';
import { PollEntity, PollStatus } from '@modules/poll/poll.entity';

const validateUserExists = async ({ userId, entityManager }: { userId: number; entityManager: EntityManager }) => {
  const user = await entityManager.findOne(UserEntity, {
    where: { id: userId },
  });
  if (!user) {
    throw new NotFoundException('User not found.');
  }

  return user;
};

const validateNewStatus = (newStatus: PollStatus) => {
  if (newStatus !== PollStatus.CLOSED) {
    throw new BadRequestException('New status must be CLOSED.');
  }
};

const validatePollExists = async ({
  pollId,
  authorId,
  where,
  relations = ['author'],
  select = { author: { id: true } },
  entityManager,
}: {
  pollId: number;
  authorId?: number;
  where?: FindOptionsWhere<PollEntity> | FindOptionsWhere<PollEntity>[];
  relations?: FindOptionsRelations<PollEntity> | string[];
  select?: FindOptionsSelect<PollEntity>;
  entityManager: EntityManager;
}) => {
  const poll = await entityManager.findOne(PollEntity, {
    where: { id: pollId, author: { id: authorId }, ...where },
    relations,
    select,
  });

  if (!poll) {
    throw new NotFoundException('Poll not found.');
  }

  return poll;
};

const validatePollAuthor = ({ authorId, userId }: { authorId: number; userId: number }) => {
  if (authorId !== userId) {
    throw new BadRequestException('You are not the author of this poll.');
  }
};

const validatePollStatus = ({ pollStatus, newStatus }: { pollStatus: PollStatus; newStatus: PollStatus }) => {
  if (newStatus === pollStatus) {
    throw new BadRequestException('Poll is already in this status.');
  }
};

const validatePollAnswered = async ({
  pollId,
  userId,
  entityManager,
}: {
  pollId: number;
  userId: number;
  entityManager: EntityManager;
}) => {
  const existingAnswers = await entityManager.find(UserAnswerEntity, {
    where: {
      user: { id: userId },
      poll: { id: pollId },
    },
  });

  if (existingAnswers.length > 0) {
    throw new BadRequestException('You have already answered this poll.');
  }
};

const validateAnyoneAnswered = async ({ pollId, entityManager }: { pollId: number; entityManager: EntityManager }) => {
  const existingAnswers = await entityManager.find(UserAnswerEntity, {
    where: {
      poll: { id: pollId },
    },
  });

  if (existingAnswers.length > 0) {
    throw new BadRequestException('You cant update this poll. Someone has already answered this poll.');
  }
};

export {
  validateUserExists,
  validateNewStatus,
  validatePollExists,
  validatePollAuthor,
  validatePollStatus,
  validatePollAnswered,
  validateAnyoneAnswered,
};

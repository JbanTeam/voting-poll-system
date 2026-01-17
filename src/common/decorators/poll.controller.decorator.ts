import { applyDecorators, Controller, Delete, Get, HttpStatus, Patch, Post } from '@nestjs/common';
import {
  ApiExtraModels,
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';

import { PollEntity } from '@modules/poll/poll.entity';
import { AnswerEntity } from '@modules/answer/answer.entity';
import { QuestionEntity } from '@modules/question/question.entity';
import { UserAnswerEntity } from '@modules/user-answer/user-answer.entity';
import { PollStatisticsEntity } from '@modules/poll-statistics/poll-statistics.entity';
import {
  closePollApiResponse,
  closePollBadRequestApiResponse,
  closePollNotFoundApiResponse,
  createUnauthorizedApiResponse,
  deletePollNotFoundApiResponse,
  getPollsApiResponse,
  getPollStatisticsApiResponse,
  saveAnswersBadRequestApiResponse,
  saveAnswersNotFoundApiResponse,
  updatePollApiResponse,
  updatePollBadRequestApiResponse,
  updatePollNotFoundApiResponse,
} from '@src/utils/swaggerUtils';

export function Poll() {
  return applyDecorators(
    ApiExtraModels(QuestionEntity, AnswerEntity, PollStatisticsEntity, UserAnswerEntity),
    ApiTags('Polls'),
    ApiBearerAuth(),
    Controller('polls'),
  );
}

export function AllPolls() {
  return applyDecorators(
    ApiOperation({ summary: 'Get all polls' }),
    ApiResponse({ ...getPollsApiResponse, description: 'Get all polls' }),
    ApiUnauthorizedResponse(createUnauthorizedApiResponse('/api/polls')),
    Get(),
  );
}

export function OwnPolls() {
  return applyDecorators(
    ApiOperation({ summary: 'Get own polls' }),
    ApiResponse({ ...getPollsApiResponse, description: 'Get own polls' }),
    ApiUnauthorizedResponse(createUnauthorizedApiResponse('/api/polls/own')),
    Get('own'),
  );
}

export function GetPoll() {
  return applyDecorators(
    ApiOperation({ summary: 'Get poll' }),
    ApiResponse({ type: PollEntity, status: HttpStatus.OK, description: 'Get poll' }),
    ApiUnauthorizedResponse(createUnauthorizedApiResponse('/api/polls/:pollId')),
    Get(':pollId'),
  );
}

export function GetPollStatistics() {
  return applyDecorators(
    ApiOperation({ summary: 'Get poll statistics' }),
    ApiResponse(getPollStatisticsApiResponse),
    ApiUnauthorizedResponse(createUnauthorizedApiResponse('/api/polls/:pollId/statistics')),
    Get(':pollId/statistics'),
  );
}

export function CreatePoll() {
  return applyDecorators(
    ApiOperation({ summary: 'Create new poll' }),
    ApiResponse({ type: PollEntity, status: HttpStatus.CREATED }),
    ApiUnauthorizedResponse(createUnauthorizedApiResponse('/api/polls')),
    Post(),
  );
}

export function SaveAnswers() {
  return applyDecorators(
    ApiOperation({ summary: 'Save user answers' }),
    ApiResponse({ ...getPollStatisticsApiResponse, status: HttpStatus.CREATED }),
    ApiNotFoundResponse(saveAnswersNotFoundApiResponse),
    ApiBadRequestResponse(saveAnswersBadRequestApiResponse),
    ApiUnauthorizedResponse(createUnauthorizedApiResponse('/api/polls/:pollId/save-answers')),
    Post(':pollId/save-answers'),
  );
}

export function ClosePoll() {
  return applyDecorators(
    ApiOperation({ summary: 'Close poll' }),
    ApiResponse(closePollApiResponse),
    ApiNotFoundResponse(closePollNotFoundApiResponse),
    ApiBadRequestResponse(closePollBadRequestApiResponse),
    ApiUnauthorizedResponse(createUnauthorizedApiResponse('/api/polls/:pollId/close')),
    Patch(':pollId/close'),
  );
}

export function UpdatePoll() {
  return applyDecorators(
    ApiOperation({
      summary: 'Update poll',
      description:
        'All fields are optional. If ID of existing question or answer is passed, it will be updated, otherwise a new question or answer will be created and existing question or answer will be deleted.',
    }),
    ApiResponse(updatePollApiResponse),
    ApiNotFoundResponse(updatePollNotFoundApiResponse),
    ApiBadRequestResponse(updatePollBadRequestApiResponse),
    ApiUnauthorizedResponse(createUnauthorizedApiResponse('/api/polls/:pollId/update')),
    Patch(':pollId/update'),
  );
}

export function DeletePoll() {
  return applyDecorators(
    ApiOperation({ summary: 'Delete poll' }),
    ApiResponse({ example: { message: 'Poll deleted successfully.' }, status: HttpStatus.OK }),
    ApiNotFoundResponse(deletePollNotFoundApiResponse),
    ApiUnauthorizedResponse(createUnauthorizedApiResponse('/api/polls/:pollId')),
    Delete(':pollId'),
  );
}

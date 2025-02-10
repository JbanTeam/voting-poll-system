import { PollEntity } from 'src/modules/poll/poll.entity';

type DecodedUser = {
  userId: number;
};

type PollsByPage = {
  data: PollEntity[];
  total: number;
  page: number;
  pageCount: number;
};

type Answer = {
  id: number;
  text: string;
};

type Stat = {
  count: number;
  answer: Answer;
};

type QuestionStats = {
  title: string;
  stats: Stat[];
};

type PollStatistics = {
  [questionId: number]: QuestionStats;
};

export { DecodedUser, PollsByPage, PollStatistics };

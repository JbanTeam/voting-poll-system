import { PollsEntity } from 'src/modules/polls/polls.entity';

type DecodedUser = {
  userId: number;
};

type PollsByPage = {
  data: PollsEntity[];
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

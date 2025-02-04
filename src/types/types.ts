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

export { DecodedUser, PollsByPage };

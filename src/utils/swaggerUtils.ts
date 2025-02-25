// AUTH********************************************
// AUTH********************************************
export const registerApiResponse = {
  status: 201,
  description: 'User has been successfully registered',
  example: {
    accessToken:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc0MDU4Mjc0MywiZXhwIjoxNzQwNTg2MzQzfQ.MSaml7J4Btk4X30rQgvyk36siAQFI_S5idAMROkryFE',
    refreshToken:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc0MDU4Mjc0MywiZXhwIjoxNzQxMTg3NTQzfQ.FIBDtnuAsAu-P7B8ZAv_I7ohQbdAXqTekDFIxirUhHI',
  },
};

export const registerBadRequestApiResponse = {
  status: 400,
  description: 'User with this email already exists',
  example: {
    error: 'User with this email already exists',
    statusCode: 400,
    timestamp: '2025-02-26T14:10:51.567Z',
    path: '/api/auth/register',
  },
};

export const loginApiResponse = {
  status: 200,
  description: 'User has been successfully logged in',
  example: {
    accessToken:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc0MDU4Mjc0MywiZXhwIjoxNzQwNTg2MzQzfQ.MSaml7J4Btk4X30rQgvyk36siAQFI_S5idAMROkryFE',
    refreshToken:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc0MDU4Mjc0MywiZXhwIjoxNzQxMTg3NTQzfQ.FIBDtnuAsAu-P7B8ZAv_I7ohQbdAXqTekDFIxirUhHI',
  },
};

export const loginBadRequestApiResponse = {
  status: 400,
  description: 'Invalid credentials',
  example: {
    error: 'Invalid credentials',
    statusCode: 400,
    timestamp: '2025-02-26T14:10:51.567Z',
    path: '/api/auth/login',
  },
};

export const logoutApiResponse = {
  status: 200,
  description: 'User has been successfully logged out',
  example: {
    message: 'Logout successfully.',
  },
};

export const logoutBadRequestApiResponse = {
  status: 400,
  description: 'Not logged in/Invalid refresh token',
  examples: {
    notLoggedIn: {
      summary: 'You are not logged in',
      value: {
        error: 'You are not logged in',
        statusCode: 400,
        timestamp: '2025-02-26T14:10:51.567Z',
        path: '/api/auth/logout',
      },
    },
    invalidRefreshToken: {
      summary: 'Invalid refresh token',
      value: {
        error: 'Invalid refresh token',
        statusCode: 400,
        timestamp: '2025-02-26T14:10:51.567Z',
        path: '/api/auth/logout',
      },
    },
  },
};

export const refreshTokenApiResponse = {
  status: 200,
  description: 'Refresh access token',
  example: {
    accessToken:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc0MDU4Mjc0MywiZXhwIjoxNzQwNTg2MzQzfQ.MSaml7J4Btk4X30rQgvyk36siAQFI_S5idAMROkryFE',
  },
};

export const refreshTokenBadRequestApiResponse = {
  status: 400,
  description: 'Invalid refresh token',
  example: {
    error: 'Invalid refresh token',
    statusCode: 400,
    timestamp: '2025-02-26T14:10:51.567Z',
    path: '/api/auth/refresh-token',
  },
};

// POLLS*************************************************
// POLLS*************************************************

export const getPollsApiResponse = {
  status: 200,
  example: {
    data: [{ id: 1, title: 'title', description: 'description' }],
    total: 1,
    page: 1,
    pageCount: 1,
  },
};

export const getPollStatisticsApiResponse = {
  status: 200,
  description: 'Get poll statistics',
  example: {
    '1': {
      title: 'Question 1',
      stats: [
        { count: 1, answer: { id: 1, text: 'Answer 1' } },
        { count: 0, answer: { id: 2, text: 'Answer 2' } },
      ],
    },
  },
};

export const updatePollApiResponse = {
  status: 200,
  example: {
    id: 1,
    title: 'Updated poll',
    description: 'Updated poll description',
    status: 'ACTIVE',
    author: { id: 1 },
    createdAt: '2025-02-24T15:43:31.838Z',
    updatedAt: '2025-02-24T15:43:31.838Z',
    closedAt: null,
    questions: [{ id: 1, text: 'Updated question', answers: [{ id: 1, text: 'Updated answer' }] }],
  },
};

export const deletePollNotFoundApiResponse = {
  status: 404,
  description: 'User not found/Poll not found',
  examples: {
    user: {
      summary: 'User not found',
      value: {
        error: 'User not found',
        statusCode: 404,
        timestamp: '2025-02-26T14:10:51.567Z',
        path: '/api/polls/1',
      },
    },
    poll: {
      summary: 'Poll not found',
      value: {
        error: 'Poll not found',
        statusCode: 404,
        timestamp: '2025-02-26T14:10:51.567Z',
        path: '/api/polls/1',
      },
    },
  },
};

export const closePollApiResponse = {
  status: 200,
  example: {
    id: 1,
    title: 'Super poll',
    description: 'Super description',
    status: 'CLOSED',
    author: { id: 1 },
    createdAt: '2025-02-24T15:43:31.838Z',
    updatedAt: '2025-02-24T15:43:31.838Z',
    closedAt: '2025-02-24T15:43:31.838Z',
    questions: [{ id: 1 }, { id: 2 }],
  },
};

export const closePollBadRequestApiResponse = {
  status: 400,
  description: 'New status must be CLOSED/Already in this status',
  examples: {
    status: {
      summary: 'New status must be CLOSED.',
      value: {
        error: 'New status must be CLOSED.',
        statusCode: 400,
        timestamp: '2025-02-26T14:10:51.567Z',
        path: '/api/polls/1/close',
      },
    },
    already: {
      summary: 'Poll is already in this status.',
      value: {
        error: 'Poll is already in this status.',
        statusCode: 404,
        timestamp: '2025-02-26T14:10:51.567Z',
        path: '/api/polls/1/update',
      },
    },
  },
};

export const closePollNotFoundApiResponse = {
  status: 404,
  description: 'Poll not found',
  examples: {
    poll: {
      summary: 'Poll not found',
      value: {
        error: 'Poll not found',
        statusCode: 404,
        timestamp: '2025-02-26T14:10:51.567Z',
        path: '/api/polls/1/close',
      },
    },
  },
};

export const updatePollNotFoundApiResponse = {
  status: 404,
  description: 'User not found/Poll not found',
  examples: {
    user: {
      summary: 'User not found',
      value: {
        error: 'User not found',
        statusCode: 404,
        timestamp: '2025-02-26T14:10:51.567Z',
        path: '/api/polls/1/update',
      },
    },
    poll: {
      summary: 'Poll not found',
      value: {
        error: 'Poll not found',
        statusCode: 404,
        timestamp: '2025-02-26T14:10:51.567Z',
        path: '/api/polls/1/update',
      },
    },
  },
};

export const updatePollBadRequestApiResponse = {
  status: 400,
  description: 'Someone has already answered this poll',
  example: {
    error: 'You cant update this poll. Someone has already answered this poll.',
    statusCode: 400,
    timestamp: '2025-02-26T14:10:51.567Z',
    path: '/api/polls/1/update',
  },
};

export const saveAnswersNotFoundApiResponse = {
  status: 404,
  description: 'User not found/Poll not found',
  examples: {
    user: {
      summary: 'User not found',
      value: {
        error: 'User not found',
        statusCode: 404,
        timestamp: '2025-02-26T14:10:51.567Z',
        path: '/api/polls/1/save-answers',
      },
    },
    poll: {
      summary: 'Poll not found',
      value: {
        error: 'Poll not found',
        statusCode: 404,
        timestamp: '2025-02-26T14:10:51.567Z',
        path: '/api/polls/1/save-answers',
      },
    },
  },
};

export const saveAnswersBadRequestApiResponse = {
  status: 400,
  description: 'You have already answered this poll',
  example: {
    error: 'You have already answered this poll.',
    statusCode: 400,
    timestamp: '2025-02-26T14:10:51.567Z',
    path: '/api/polls/1/save-answers',
  },
};

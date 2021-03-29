export const MESSAGES = {
  GET_ACCOUNT_INFO: 'GET_ACCOUNT_INFO',
  GET_SERVER_INFO: 'GET_SERVER_INFO',
};

export const MESSAGES_PARAMS = [
  {
    name: MESSAGES.GET_ACCOUNT_INFO,
    params: [
      {
        name: 'accountInfoKey',
        defaultValue:
          'f1f3816b898cb100b336c169a1ca3e2571ed8fa55687c58a381ece7406cdb88b7703a2088169d725d7a3f0b03e6d2f538d10f81ea0df8869e025309c259f15dc',
      },
    ],
  },
  {
    name: MESSAGES.GET_SERVER_INFO,
    params: [],
  },
] as const;

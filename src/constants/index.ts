export const REPOSITORY_URL = 'https://github.com/blockfrost/websocket-link';

export const MESSAGES = {
  GET_SERVER_INFO: 'GET_SERVER_INFO',
  GET_ACCOUNT_INFO: 'GET_ACCOUNT_INFO',
  GET_ACCOUNT_UTXO: 'GET_ACCOUNT_UTXO',
  GET_TRANSACTION: 'GET_TRANSACTION',
  GET_BLOCK: 'GET_BLOCK',

  SUBSCRIBE_BLOCK: 'SUBSCRIBE_BLOCK',
  SUBSCRIBE_ADDRESS: 'SUBSCRIBE_ADDRESS',
  SUBSCRIBE_ACCOUNT: 'SUBSCRIBE_ACCOUNT',
  UNSUBSCRIBE_BLOCK: 'UNSUBSCRIBE_BLOCK',
  UNSUBSCRIBE_ADDRESS: 'UNSUBSCRIBE_ADDRESS',
  UNSUBSCRIBE_ACCOUNT: 'UNSUBSCRIBE_ACCOUNT',

  PUSH_TRANSACTION: 'PUSH_TRANSACTION',

  ERROR: 'ERROR',
  CONNECT: 'CONNECT',
} as const;

export const MESSAGES_RESPONSE = {
  SERVER_INFO: 'SERVER_INFO',
  ACCOUNT_INFO: 'ACCOUNT_INFO',
  ACCOUNT_UTXO: 'ACCOUNT_UTXO',
  TRANSACTION: 'TRANSACTION',
  BLOCK: 'BLOCK',

  PUSH_TRANSACTION: 'PUSH_TRANSACTION',

  ERROR: 'ERROR',
  CONNECT: 'CONNECT',
} as const;

export const ADDRESS_GAP_LIMIT = 20;

export const WELCOME_MESSAGE = `Hello there! see: <a href="${REPOSITORY_URL}">${REPOSITORY_URL}</a>`;

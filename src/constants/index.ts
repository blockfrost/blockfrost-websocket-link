export const REPOSITORY_URL = 'https://github.com/blockfrost/websocket-link';
export const BLOCKFROST_MAINNET_URL = 'https://cardano-mainnet.blockfrost.io/api';
export const MESSAGES = {
  GET_SERVER_INFO: 'GET_SERVER_INFO',
  GET_ACCOUNT_INFO: 'GET_ACCOUNT_INFO',
  GET_ACCOUNT_UTXO: 'GET_ACCOUNT_UTXO',
  ERROR: 'ERROR',
  CONNECT: 'CONNECT',
} as const;
export const ADDRESS_GAP_LIMIT = 20;
export const WELCOME_MESSAGE = `Hello there! see: <a href="${REPOSITORY_URL}">${REPOSITORY_URL}</a>`;

import WebSocket from 'ws';

export interface Ws extends WebSocket {
  isAlive: boolean;
}

export interface Balance {
  unit: string;
  quantity: string;
}

export interface ServerInfo {
  url: string;
  name: string;
  shortcut: string;
  testnet: boolean;
  version: string;
  decimals: number;
  blockHeight: number;
  blockHash: string;
}

export interface AccountInfo {
  balance: string;
  descriptor: string;
}

export type Message =
  | {
      command: 'GET_ACCOUNT_INFO';
      params: {
        descriptor: string;
      };
    }
  | {
      command: 'GET_SERVER_INFO';
      params: null;
    }
  | {
      command: 'ERROR';
      params: null;
    };

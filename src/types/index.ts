import WebSocket from 'ws';

export interface Ws extends WebSocket {
  isAlive: boolean;
}

export interface Balance {
  unit: string;
  quantity: string;
}

export type AddressType = 1 | 0;

export interface ResponseServerInfo {
  url: string;
  name: string;
  shortcut: string;
  testnet: boolean;
  version: number;
  decimals: number;
  blockHeight: number;
  blockHash: string;
}

export type ResponseBlockHash = string;

export type Details = 'basic' | 'tokens' | 'tokenBalances' | 'txids' | 'txs';

export interface ResponseAccountInfo {
  balance: string;
  descriptor: string;
  tokens?: Balance[];
}

export type IncomingMessage =
  | {
      id: number;
      command: 'GET_ACCOUNT_INFO';
      params: {
        descriptor: string;
        details: Details;
      };
    }
  | {
      id: number;
      command: 'GET_ACCOUNT_UTXO';
      params: {
        descriptor: string;
      };
    }
  | {
      id: number;
      command: 'GET_TRANSACTION';
      params: {
        txId: string;
      };
    }
  | {
      id: number;
      command: 'GET_SERVER_INFO';
      params: null;
    }
  | {
      id: number;
      command: 'GET_BLOCK_HASH';
      params: {
        hashOrNumber: string | number;
      };
    }
  | {
      id: number;
      command: 'SUBSCRIBE_BLOCK';
      params: null;
    }
  | {
      id: number;
      command: 'UNSUBSCRIBE_BLOCK';
      params: null;
    }
  | {
      id: number;
      command: 'ERROR';
      params: null;
    };

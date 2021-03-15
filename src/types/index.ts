import WebSocket from 'ws';

export interface Ws extends WebSocket {
  isAlive: boolean;
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
}

export type Message =
  | { name: 'GET_SERVER_INFO'; params: { descriptor: string } }
  | { name: 'GET_SERVER_INFO'; params: null };

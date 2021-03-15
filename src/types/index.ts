import WebSocket from 'ws';

export interface Ws extends WebSocket {
  isAlive: boolean;
}

export interface ServerInfo {
  name: string;
  shortcut: string;
  testnet: boolean;
  version: string;
  decimals: number;
  blockHeight: number;
  blockHash: number;
}

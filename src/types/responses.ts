import { Balance } from './addresses';

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

export type BlockHash = string;

export interface AccountInfo {
  balance: string;
  descriptor: string;
  tokens?: Balance[];
}

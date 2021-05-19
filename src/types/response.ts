import { Balance } from './address';
import { Responses } from '@blockfrost/blockfrost-js';

export interface ServerInfo {
  name: string;
  shortcut: string;
  testnet: boolean;
  version: string;
  decimals: number;
  blockHeight: number;
  blockHash: string;
}

export type BlockHash = string;

type Transactions =
  | {
      address: string;
      data: string[];
    }[]
  | {
      address: string;
      data: Responses['tx_content'];
    }[];

export interface AccountInfo {
  balance: string;
  addresses: {
    change: string[];
    used: string[];
    unused: string[];
  };
  empty: boolean;
  availableBalance: string;
  descriptor: string;
  tokens?: Balance[];
  history: {
    total: number; // total transactions
    tokens?: number; // tokens transactions
    unconfirmed: number; // unconfirmed transactions
    transactions?: Transactions; // list of transactions
  };
  page: {
    size: number;
    total: number;
    index: number;
  };
}

import { Balance } from './address';
import { Responses } from '@blockfrost/blockfrost-js';

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
  descriptor: string;
  tokens?: Balance[];
  transactions?: Transactions;
  totalPages?: number;
}

import { Schemas } from '@blockfrost/blockfrost-js/lib/types/open-api.js';
import { Balance, AddressData, UtxosWithBlockResponse } from './address.js';
import { MessageId } from './message.js';
import {
  TransformedTransaction,
  TransformedTransactionUtxo,
  TxIdsToTransactionsResponse,
} from './transactions.js';

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

type Transactions = TxIdsToTransactionsResponse[];
export interface AssetBalance extends Balance {
  fingerprint?: string; // lovelace has no fingerprint
  decimals: number;
  ticker?: string | null;
  name?: string | null;
}

export interface AccountInfo {
  balance: string;
  addresses?: {
    change: AddressData[];
    used: AddressData[];
    unused: AddressData[];
  };
  empty: boolean;
  availableBalance: string;
  descriptor: string;
  tokens?: AssetBalance[];
  history: {
    total: number; // total transactions
    unconfirmed: number; // unconfirmed transactions
    transactions?: Transactions; // list of transactions
    txids?: string[];
  };
  page: {
    size: number;
    total: number;
    index: number;
  };
  misc: {
    staking: {
      address: string;
      isActive: boolean;
      rewards: string;
      poolId: string | null;
      drep: {
        drep_id: string;
        hex: string;
        amount: string;
        active: boolean;
        active_epoch: number | null;
        has_script: boolean;
      } | null;
    };
  };
}

export interface TxNotification {
  address: string;
  txHash: string;
  txData: TransformedTransaction;
  txUtxos: TransformedTransactionUtxo;
  txCbor?: string;
}

export interface BalanceHistoryData {
  time: number;
  txs: number;
  received: string;
  sent: string;
  sentToSelf: string;
  rates?: { [k: string]: number | undefined };
}

export type Responses = {
  id: MessageId;
  clientId: string;
  data:
    | ServerInfo
    | AccountInfo
    | string
    | { address: string }
    | null
    | Schemas['block_content']
    | BalanceHistoryData[]
    | TxIdsToTransactionsResponse[]
    | TransformedTransaction
    | UtxosWithBlockResponse[]
    | { subscribed: boolean }
    | { lovelacePerByte: number };
};

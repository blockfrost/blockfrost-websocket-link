import { Responses } from '@blockfrost/blockfrost-js';

export interface Data {
  txUtxos: Responses['tx_content_utxo'];
  txData: Responses['tx_content'];
}

export interface TxIdsToTransactionsResponse extends Data {
  address: string;
  txHash: string;
}

export interface TxIdsToTransactionsPromises {
  address: string;
  txHash: string;
  promise: Promise<Data>;
}

export interface BalanceHistoryItem {
  time: number;
  txs: number;
  received: string;
  sent: string;
  sentToSelf: string;
  rates: Record<string, number>;
}

import { AssetBalance } from './response.js';
export interface TxIdsToTransactionsResponse {
  txUtxos: TransformedTransactionUtxo;
  txData: TransformedTransaction;
  address: string;
  txHash: string;
}

export interface TransformedTransactionUtxo {
  /** Transaction hash */
  hash: string;
  inputs: {
    /** Input address */
    address: string;
    amount: AssetBalance[];
    /** Hash of the UTXO transaction */
    tx_hash: string;
    /** UTXO index in the transaction */
    output_index: number;
    /** The hash of the transaction output datum */
    data_hash: string | null;
    /** Whether the input is a collateral consumed on script validation failure */
    collateral: boolean;
  }[];
  outputs: {
    /** Output address */
    address: string;
    amount: AssetBalance[];
    /** UTXO index in the transaction */
    output_index: number;
    /** The hash of the transaction output datum */
    data_hash: string | null;
  }[];
}

export interface TransformedTransaction {
  /** Transaction hash */
  hash: string;
  /** Block hash */
  block: string;
  /** Block number */
  block_height: number;
  /** Block creation time in UNIX time */
  block_time: number;
  /** Slot number */
  slot: number;
  /** Transaction index within the block */
  index: number;
  output_amount: AssetBalance[];
  /** Fees of the transaction in Lovelaces */
  fees: string;
  /** Deposit within the transaction in Lovelaces */
  deposit: string;
  /** Size of the transaction in Bytes */
  size: number;
  /** Left (included) endpoint of the timelock validity intervals */
  invalid_before: string | null;
  /** Right (excluded) endpoint of the timelock validity intervals */
  invalid_hereafter: string | null;
  /** Count of UTXOs within the transaction */
  utxo_count: number;
  /** Count of the withdrawals within the transaction */
  withdrawal_count: number;
  /** Count of the MIR certificates within the transaction */
  mir_cert_count: number;
  /** Count of the delegations within the transaction */
  delegation_count: number;
  /** Count of the stake keys (de)registration within the transaction */
  stake_cert_count: number;
  /** Count of the stake pool registration and update certificates within the transaction */
  pool_update_count: number;
  /** Count of the stake pool retirement certificates within the transaction */
  pool_retire_count: number;
  /** Count of asset mints and burns within the transaction */
  asset_mint_or_burn_count: number;
  /** Count of redeemers within the transaction */
  redeemer_count: number;
  /** True if contract script passed validation */
  valid_contract: boolean;
}

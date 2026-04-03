import { fetchTransactionData } from '../utils/transaction.js';

export default async (txId: string, cbor?: boolean) => fetchTransactionData(txId, cbor);

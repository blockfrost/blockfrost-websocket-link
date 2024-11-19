import { prepareMessage } from '../utils/message.js';
import { fetchTransactionData } from '../utils/transaction.js';
import { MessageId } from '../types/message.js';

export default async (id: MessageId, clientId: string, txId: string, cbor?: boolean) =>
  prepareMessage({ id, clientId, data: await fetchTransactionData(txId, cbor) });

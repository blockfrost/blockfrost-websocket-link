import { prepareMessage } from '../utils/message.js';
import { fetchTransactionData } from '../utils/transaction.js';
import { MessageId } from '../types/message.js';

export default async (id: MessageId, clientId: string, txId: string): Promise<string> => {
  const data = await fetchTransactionData(txId);
  const message = prepareMessage({ id, clientId, data });

  return message;
};

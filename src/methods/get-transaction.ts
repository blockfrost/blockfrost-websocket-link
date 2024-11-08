import { prepareMessage } from '../utils/message.js';
import { blockfrostAPI } from '../utils/blockfrost-api.js';
import { transformTransactionData } from '../utils/transaction.js';
import { MessageId } from '../types/message.js';

export default async (id: MessageId, clientId: string, txId: string): Promise<string> => {
  const tx = await blockfrostAPI.txs(txId);
  const data = await transformTransactionData(tx);
  const message = prepareMessage({ id, clientId, data });

  return message;
};

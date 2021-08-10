import { TxIdsToTransactionsResponse } from 'types/transactions';

export const paginate = (
  transactions: TxIdsToTransactionsResponse[],
  pageSize: number,
): TxIdsToTransactionsResponse[][] => {
  return transactions.reduce((ac, val, i) => {
    const id = Math.floor(i / pageSize);
    const page = ac[id] || (ac[id] = []);
    page.push(val);
    return ac;
  }, [] as TxIdsToTransactionsResponse[][]);
};

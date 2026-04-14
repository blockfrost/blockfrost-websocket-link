import PQueue from 'p-queue';

import { blockfrostAPI } from '../utils/blockfrost-api.js';
import { BLOCKFROST_REQUEST_CONCURRENCY } from '../constants/config.js';

const limiter = new PQueue({ concurrency: BLOCKFROST_REQUEST_CONCURRENCY });

const log = () => {
  return `Rate limiter:

Tasks in queue: ${limiter.size}
Tasks running: ${limiter.pending}
${'-'.repeat(60)}
`;
};

const withLimiter = <Params extends unknown[], Response>(
  func: (...params: Params) => Promise<Response>,
  thisObj: unknown = blockfrostAPI,
) => {
  const wrapped = (...params: Params) =>
    limiter.add<Response>(() => func.apply(thisObj, params), {
      throwOnTimeout: true,
    });

  Object.defineProperty(wrapped, 'name', { value: func.name });

  return wrapped;
};

/** These are all blockfrostAPI methods used in this package: */

blockfrostAPI.accounts = withLimiter(blockfrostAPI.accounts);
blockfrostAPI.accountsAddressesTotal = withLimiter(blockfrostAPI.accountsAddressesTotal);
blockfrostAPI.addresses = withLimiter(blockfrostAPI.addresses);
blockfrostAPI.addressesTotal = withLimiter(blockfrostAPI.addressesTotal);
blockfrostAPI.addressesTransactions = withLimiter(blockfrostAPI.addressesTransactions); // Used only internally by addressesTransactionsAll
// blockfrostAPI.addressesTransactionsAll
blockfrostAPI.addressesUtxos = withLimiter(blockfrostAPI.addressesUtxos); // Used only internally by addressesUtxosAll
// blockfrostAPI.addressesUtxosAll
blockfrostAPI.assetsAddresses = withLimiter(blockfrostAPI.assetsAddresses);
blockfrostAPI.assetsById = withLimiter(blockfrostAPI.assetsById);
blockfrostAPI.blocks = withLimiter(blockfrostAPI.blocks);
blockfrostAPI.blocksAddresses = withLimiter(blockfrostAPI.blocksAddresses); // Used only internally by blocksAddressesAll
// blockfrostAPI.blocksAddressesAll
blockfrostAPI.blocksLatest = withLimiter(blockfrostAPI.blocksLatest);
blockfrostAPI.epochsLatest = withLimiter(blockfrostAPI.epochsLatest);
blockfrostAPI.epochsLatestParameters = withLimiter(blockfrostAPI.epochsLatestParameters);
blockfrostAPI.epochsParameters = withLimiter(blockfrostAPI.epochsParameters);
blockfrostAPI.governance.drepsById = withLimiter(
  blockfrostAPI.governance.drepsById,
  blockfrostAPI.governance,
);
blockfrostAPI.root = withLimiter(blockfrostAPI.root);
blockfrostAPI.txs = withLimiter(blockfrostAPI.txs);
blockfrostAPI.txsCbor = withLimiter(blockfrostAPI.txsCbor);
blockfrostAPI.txsUtxos = withLimiter(blockfrostAPI.txsUtxos);

export default { log };

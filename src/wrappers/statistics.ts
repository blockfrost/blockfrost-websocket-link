/* eslint-disable unicorn/no-array-reduce */

import { blockfrostAPI } from '../utils/blockfrost-api.js';

const TIMEFRAME = 60 * 60 * 1000; // last hour
const CALLS: [string, number, number | undefined][] = [];

const cleanup = (multiplier: number) => {
  const first = CALLS[0];
  const now = Date.now();

  if (first && now - first[1] > multiplier * TIMEFRAME) {
    const index = CALLS.findIndex(([, from]) => now - from <= TIMEFRAME);

    CALLS.splice(0, index < 0 ? CALLS.length : index);
  }
};

const printRow = (a: string, b: string, c: string, d: string, e: string, f: string) =>
  `${a.padEnd(25)}${b.padStart(15)}${c.padStart(15)}${d.padStart(12)}${e.padStart(12)}${f.padStart(
    12,
  )}`;

const log = () => {
  cleanup(1); // throw away every call older than one hour

  return `Method calls since last hour:

${printRow('', 'Pending (#)', 'Resolved (#)', 'Avg (ms)', 'Min (ms)', 'Max (ms)')}
${Object.entries(
  CALLS.reduce<{ [method: string]: number[] }>(
    (acc, [method, from, to]) => ({
      ...acc,
      [method]: [...(acc[method] ?? []), to ? to - from : Number.NaN],
    }),
    {},
  ),
)
  .sort(([, a], [, b]) => b.length - a.length)
  .map(([method, times]) => {
    const resolved = times.filter(Boolean);
    const pending = times.length - resolved.length;

    if (resolved.length === 0) {
      return [method, String(pending), '-', '-', '-', '-'] as const;
    }

    const min = resolved.reduce((acc, n) => Math.min(acc, n), Number.MAX_VALUE).toFixed(0);
    const max = resolved.reduce((acc, n) => Math.max(acc, n), Number.MIN_VALUE).toFixed(0);
    const avg = resolved.reduce((acc, n) => acc + n / resolved.length, 0).toFixed(0);

    return [method, String(pending), String(resolved.length), avg, min, max] as const;
  })
  .map(row => printRow(...row))
  .join('\n')}
${'-'.repeat(60)}
`;
};

const onCallStart = (method: string) => {
  cleanup(1.25); // throw away every call older than 75 minutes

  const stats: (typeof CALLS)[number] = [method, Date.now(), undefined];

  CALLS.push(stats);
  return () => {
    stats[2] = Date.now();
  };
};

const withStats = <Params extends unknown[], Response>(
  func: (...params: Params) => Promise<Response>,
  thisObj: unknown = blockfrostAPI,
) => {
  const wrapped = (...params: Params) =>
    func.apply(thisObj, params).finally(onCallStart(func.name));

  Object.defineProperty(wrapped, 'name', { value: func.name });

  return wrapped;
};

/** These are all blockfrostAPI methods used in this package: */

blockfrostAPI.accounts = withStats(blockfrostAPI.accounts);
blockfrostAPI.accountsAddressesTotal = withStats(blockfrostAPI.accountsAddressesTotal);
blockfrostAPI.addresses = withStats(blockfrostAPI.addresses);
blockfrostAPI.addressesTotal = withStats(blockfrostAPI.addressesTotal);
blockfrostAPI.addressesTransactions = withStats(blockfrostAPI.addressesTransactions); // Used only internally by addressesTransactionsAll
// blockfrostAPI.addressesTransactionsAll
blockfrostAPI.addressesUtxos = withStats(blockfrostAPI.addressesUtxos); // Used only internally by addressesUtxosAll
// blockfrostAPI.addressesUtxosAll
blockfrostAPI.assetsAddresses = withStats(blockfrostAPI.assetsAddresses);
blockfrostAPI.assetsById = withStats(blockfrostAPI.assetsById);
blockfrostAPI.blocks = withStats(blockfrostAPI.blocks);
blockfrostAPI.blocksAddresses = withStats(blockfrostAPI.blocksAddresses); // Used only internally by blocksAddressesAll
// blockfrostAPI.blocksAddressesAll
blockfrostAPI.blocksLatest = withStats(blockfrostAPI.blocksLatest);
blockfrostAPI.epochsLatest = withStats(blockfrostAPI.epochsLatest);
blockfrostAPI.epochsLatestParameters = withStats(blockfrostAPI.epochsLatestParameters);
blockfrostAPI.epochsParameters = withStats(blockfrostAPI.epochsParameters);
blockfrostAPI.governance.drepsById = withStats(
  blockfrostAPI.governance.drepsById,
  blockfrostAPI.governance,
);
blockfrostAPI.root = withStats(blockfrostAPI.root);
blockfrostAPI.txs = withStats(blockfrostAPI.txs);
blockfrostAPI.txsCbor = withStats(blockfrostAPI.txsCbor);
blockfrostAPI.txsUtxos = withStats(blockfrostAPI.txsUtxos);

export default { log };

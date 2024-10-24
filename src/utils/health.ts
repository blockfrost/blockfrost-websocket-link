import { ALL_SEED } from '../scripts/performance/constants.js';
import { WebsocketClient } from './websocket-client.js';

export const healthCheck = async (url: string) => {
  // Public key of the account that will be used to perform health check
  // Account is already used on every network (mainnet, preprod, preview)
  // One of the account testnet address: addr_test1qrx7xj9qf0j8cqty3eyntpentpgkuhzt9n7g06fa7l29sucle6svh9nacvm632nmcy6fnw9sq85tqkvhagfrhkj9tf6sa3ccwq
  const ACCOUNT_PUB_KEY =
    '140791584001446365f169c82241c7c214475000180dab39fa0588fc9c3d6d807f9f812d49816844b52e319857aa75961724ad1a146701679d02d7168622233d';
  const c = new WebsocketClient(url, false);

  await c.waitForConnection();

  const serverInfo = await c.sendAndWait('GET_SERVER_INFO');

  if (serverInfo.name !== 'Cardano') {
    console.info('[HealthCheck] Received GET_SERVER_INFO', serverInfo);
    c.close();
    throw new Error('[HealthCheck] HealthCheck failed: GET_SERVER_INFO');
  }

  const xpub = ALL_SEED[1];

  const basicAccountInfo = await c.sendAndWait('GET_ACCOUNT_INFO', {
    descriptor: xpub,
    details: 'basic',
    pageSize: 25,
  });

  if (basicAccountInfo.descriptor !== ACCOUNT_PUB_KEY || basicAccountInfo.empty !== false) {
    c.close();
    console.info('[HealthCheck] Received GET_ACCOUNT_INFO (basic)', basicAccountInfo);
    throw new Error('[HealthCheck] HealthCheck failed: GET_ACCOUNT_INFO (basic)');
  }

  const txsAccountInfo = await c.sendAndWait('GET_ACCOUNT_INFO', {
    descriptor: xpub,
    details: 'txs',
    pageSize: 25,
  });

  if (txsAccountInfo.descriptor !== ACCOUNT_PUB_KEY || txsAccountInfo.empty !== false) {
    console.info('[HealthCheck] Received GET_ACCOUNT_INFO (txs)', txsAccountInfo);
    c.close();
    throw new Error('[HealthCheck] HealthCheck failed: GET_ACCOUNT_INFO (txs)');
  }

  const accountUtxo = await c.sendAndWait('GET_ACCOUNT_UTXO', {
    descriptor: xpub,
  });

  if (!Array.isArray(accountUtxo)) {
    console.info('[HealthCheck] Received GET_ACCOUNT_UTXO', accountUtxo);
    c.close();
    throw new Error('[HealthCheck] HealthCheck failed: GET_ACCOUNT_UTXO');
  }

  c.close();
};

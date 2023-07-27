import { ALL_SEED } from '../../scripts/performance/constants.js';
import { WebsocketClient } from './websocket-client.js';

export const healthCheck = async (url: string) => {
  const c = new WebsocketClient(url, false);

  await c.waitForConnection();

  const serverInfo = await c.sendAndWait('GET_SERVER_INFO');

  if (serverInfo.name !== 'Cardano') {
    c.close();
    throw new Error('[HealthCheck] HealthCheck failed: serverInfo');
  }

  const xpub = ALL_SEED[1];

  const basicAccountInfo = await c.sendAndWait('GET_ACCOUNT_INFO', {
    descriptor: xpub,
    details: 'basic',
    pageSize: 25,
  });

  if (
    basicAccountInfo.descriptor !==
      '140791584001446365f169c82241c7c214475000180dab39fa0588fc9c3d6d807f9f812d49816844b52e319857aa75961724ad1a146701679d02d7168622233d' ||
    basicAccountInfo.empty !== false
  ) {
    c.close();
    throw new Error('[HealthCheck] HealthCheck failed: basicAccountInfo');
  }

  const txsAccountInfo = await c.sendAndWait('GET_ACCOUNT_INFO', {
    descriptor: xpub,
    details: 'txs',
    pageSize: 25,
  });

  if (
    txsAccountInfo.descriptor !==
      '140791584001446365f169c82241c7c214475000180dab39fa0588fc9c3d6d807f9f812d49816844b52e319857aa75961724ad1a146701679d02d7168622233d' ||
    txsAccountInfo.empty !== false
  ) {
    c.close();
    throw new Error('[HealthCheck] HealthCheck failed: txsAccountInfo');
  }

  const accountUtxo = await c.sendAndWait('GET_ACCOUNT_UTXO', {
    descriptor: xpub,
  });

  if (!Array.isArray(accountUtxo)) {
    c.close();
    throw new Error('[HealthCheck] HealthCheck failed: accountUtxo');
  }

  c.close();
};

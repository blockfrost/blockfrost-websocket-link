import { WebsocketClient } from './websocket-client.js';

export const healthCheck = async (url: string) => {
  const c = new WebsocketClient(url, false);

  await c.waitForConnection();

  const serverInfo = await c.sendAndWait('GET_SERVER_INFO');

  if (serverInfo.name !== 'Cardano') {
    c.close();
    console.info('[HealthCheck] Received GET_SERVER_INFO', serverInfo);
    throw new Error('[HealthCheck] HealthCheck failed: GET_SERVER_INFO');
  }

  const blockInfo = await c.sendAndWait('GET_BLOCK', {
    hashOrNumber: 12_606_136,
  });

  if (blockInfo.hash !== 'a3a107cac976e01ba40e15ac3c2db3f421373d63587105166ba01a0ec1538018') {
    c.close();
    console.info('[HealthCheck] Received GET_BLOCK', blockInfo);
    throw new Error('[HealthCheck] HealthCheck failed: GET_BLOCK');
  }

  const txInfo = await c.sendAndWait('GET_TRANSACTION', {
    txId: '8278d71d95762c97278793f407700f5c7f19fad5218273410e5fb883661a2055',
  });

  if (
    txInfo.block !== 'a3a107cac976e01ba40e15ac3c2db3f421373d63587105166ba01a0ec1538018' ||
    txInfo.fees !== '165748'
  ) {
    c.close();
    console.info('[HealthCheck] Received GET_TRANSACTION', txInfo);
    throw new Error('[HealthCheck] HealthCheck failed: GET_TRANSACTION');
  }

  c.close();
};

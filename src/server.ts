import * as os from 'os';
import express from 'express';
import http from 'http';
import { WebSocketServer } from 'ws';
import dotenv from 'dotenv';
dotenv.config();
import { Responses } from '@blockfrost/blockfrost-js';
import * as Sentry from '@sentry/node';
import * as Tracing from '@sentry/tracing';
import { CaptureConsole } from '@sentry/integrations';
import { v4 as uuidv4 } from 'uuid';
import * as Server from './types/server.js';
import { MESSAGES, WELCOME_MESSAGE, REPOSITORY_URL } from './constants/index.js';
import { getMessage, prepareErrorMessage, prepareMessage } from './utils/message.js';
import { MetricsCollector } from './utils/prometheus.js';
import { events, onBlock, startEmitter } from './events.js';
import getServerInfo from './methods/get-server-info.js';
import getAccountInfo from './methods/get-account-info.js';
import getAccountUtxo from './methods/get-account-utxo.js';
import getBlock from './methods/get-block.js';
import getTransaction from './methods/get-transaction.js';
import submitTransaction from './methods/push-transaction.js';
import estimateFee from './methods/estimate-fee.js';
import getBalanceHistory from './methods/get-balance-history.js';
import { getAffectedAddresses } from './utils/address.js';
import { logger } from './utils/logger.js';
import { METRICS_COLLECTOR_INTERVAL_MS } from './constants/config.js';
import { getPort } from './utils/server.js';

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const packageJson = require('../package.json');

const app = express();

if (!process.env.BLOCKFROST_PROJECT_ID) {
  throw new Error(`Missing BLOCKFROST_PROJECT_ID env variable. See ${REPOSITORY_URL}`);
}

if (!process.env.BLOCKFROST_NETWORK) {
  throw new Error(`Missing BLOCKFROST_NETWORK env variable. See ${REPOSITORY_URL}`);
}

if (process.env.BLOCKFROST_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.BLOCKFROST_SENTRY_DSN,
    release: `websocket-link@${packageJson.version}`,
    environment: process.env.NODE_ENV,
    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
      new Tracing.Integrations.Express({ app }),
      new CaptureConsole({
        levels: ['error'],
      }),
    ],
    tracesSampleRate: 0.5,
    initialScope: {
      tags: { hostname: os.hostname(), network: process.env.BLOCKFROST_NETWORK },
    },
  });
}

const port = getPort();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

server.keepAliveTimeout = 65_000;

const activeSubscriptions: Record<string, Server.Subscription[]> = {};
const addressesSubscribed: Record<string, string[]> = {};

const clients: Array<{
  clientId: string;
  newBlockCallback: (
    latestBlock: Responses['block_content'],
    affectedAddresses: Responses['block_content_addresses'],
  ) => Promise<void>;
}> = [];

// index route
app.get('/', (_request, response) => {
  response.send(WELCOME_MESSAGE);
});

// status route
app.get('/status', (_request, response) => {
  response.send({
    status: 'ok',
    commit: process.env.BUILD_COMMIT ?? 'BUILD_COMMIT not set',
    version: packageJson.version,
  });
});

const metricsCollector = new MetricsCollector(wss, METRICS_COLLECTOR_INTERVAL_MS);

// metrics route
app.get('/metrics', (_request, response) => {
  response.setHeader('Content-Type', 'text/plain');
  response.send(metricsCollector.toJson());
});

const heartbeat = (ws: Server.Ws) => {
  ws.isAlive = true;
};

function noop() {}

// ping all clients every 30s to keep connection alive
setInterval(() => {
  const connectedClientsIds: string[] = [];

  for (const w of wss.clients) {
    const ws = w as Server.Ws;

    if (ws.isAlive === false) {
      logger.debug(`[${ws.uid}] Terminating stale connection for the client.`);
      ws.terminate();
      continue;
    }

    ws.isAlive = false;
    logger.debug(`Sending ping for client ${ws.uid}`);
    ws.ping(noop);
    connectedClientsIds.push(ws.uid);
  }

  // remove subscriptions for disconnected clients
  // (synchronizes list of clients' subscriptions with the list of the clients still connected to websocket)
  for (let i = clients.length - 1; i >= 0; i--) {
    const client = clients[i];
    // If client for which we store a subscription is not in list of websocket clients then delete its subscription

    if (!connectedClientsIds.includes(client.clientId)) {
      const index = clients.findIndex(c => c.clientId === client.clientId);

      clients.splice(index, 1);
    }
  }
}, 30_000);

startEmitter();
// this event is triggered with every new block see events.ts
events.on('newBlock', async (latestBlock: Responses['block_content']) => {
  logger.info(
    `Retrieving affected addressed for newBlock ${latestBlock.hash} ${latestBlock.height}`,
  );
  try {
    // TODO: move fetching affected address for the block to newBlock emitter
    // So if fetching affected addresses returns 404 due to block rollback it won't be emitted
    const affectedAddresses = await getAffectedAddresses(latestBlock.height);

    logger.debug(`Running newBlock callback for ${clients.length} clients`);
    for (const client of clients) {
      client.newBlockCallback(latestBlock, affectedAddresses);
    }
  } catch (error) {
    logger.error(
      `Failed to notify clients about new block ${latestBlock.hash} ${latestBlock.height}.`,
      error,
    );
  }
});

wss.on('connection', async (ws: Server.Ws) => {
  ws.isAlive = true;
  // generate unique client ID and set callbacks
  const clientId = uuidv4();

  ws.uid = clientId;
  addressesSubscribed[clientId] = [];
  activeSubscriptions[clientId] = [];
  clients.push({
    clientId,
    newBlockCallback: (latestBlock, affectedAddresses) =>
      onBlock(
        ws,
        clientId,
        latestBlock,
        affectedAddresses,
        activeSubscriptions[clientId],
        addressesSubscribed[clientId],
      ),
  });

  logger.info(`[${clientId}] Client connected. Total clients connected: ${wss.clients.size}.`);

  // general messages
  ws.on('message', async (message: string) => {
    const data = getMessage(message);

    if (!data) {
      const message = prepareErrorMessage(-1, 'Cannot parse the message', clientId);

      logger.debug(`[${clientId}] Received invalid message`, message);
      ws.send(message);
      return;
    }
    logger.debug(
      `[${clientId}] RECV MSG ID ${data.id} "${data?.command}" with params: ${JSON.stringify(
        data.params,
      )}`,
    );

    switch (data.command) {
      case MESSAGES.GET_SERVER_INFO: {
        const message = await getServerInfo(data.id, clientId);

        ws.send(message);
        break;
      }

      case MESSAGES.GET_TRANSACTION: {
        const message = await getTransaction(data.id, clientId, data.params.txId);

        ws.send(message);
        break;
      }

      case MESSAGES.GET_BLOCK: {
        const message = await getBlock(data.id, clientId, data.params.hashOrNumber);

        ws.send(message);
        break;
      }

      case MESSAGES.GET_ACCOUNT_UTXO: {
        const message = await getAccountUtxo(data.id, clientId, data.params.descriptor);

        ws.send(message);
        break;
      }

      case MESSAGES.ESTIMATE_FEE: {
        const message = await estimateFee(data.id, clientId);

        ws.send(message);
        break;
      }

      case MESSAGES.GET_ACCOUNT_INFO: {
        const message = await getAccountInfo(
          data.id,
          clientId,
          data.params.descriptor,
          data.params.details,
          data.params.page,
          data.params.pageSize,
        );

        ws.send(message);
        break;
      }

      case MESSAGES.GET_BALANCE_HISTORY: {
        const message = await getBalanceHistory(
          data.id,
          clientId,
          data.params.descriptor,
          data.params.groupBy,
          data.params.from,
          data.params.to,
        );

        ws.send(message);
        break;
      }

      case MESSAGES.SUBSCRIBE_BLOCK: {
        const activeBlockSubIndex = activeSubscriptions[clientId].findIndex(
          index => index.type === 'block',
        );

        if (activeBlockSubIndex > -1) {
          activeSubscriptions[clientId].splice(activeBlockSubIndex);
        }

        activeSubscriptions[clientId].push({
          type: 'block',
          id: data.id,
        });

        const message = prepareMessage(data.id, clientId, { subscribed: true });

        ws.send(message);

        break;
      }

      case MESSAGES.UNSUBSCRIBE_BLOCK: {
        const activeBlockSubIndex = activeSubscriptions[clientId].findIndex(
          index => index.type === 'block',
        );

        if (activeBlockSubIndex > -1) {
          activeSubscriptions[clientId].splice(activeBlockSubIndex);
        }

        const message = prepareMessage(data.id, clientId, {
          subscribed: false,
        });

        ws.send(message);

        break;
      }

      case MESSAGES.SUBSCRIBE_ADDRESS: {
        if (data.params.addresses && data.params.addresses.length > 0) {
          for (const addressInput of data.params.addresses) {
            if (!addressesSubscribed[clientId].includes(addressInput)) {
              addressesSubscribed[clientId].push(addressInput);
            }
          }

          const activeAddressSubIndex = activeSubscriptions[clientId].findIndex(
            index => index.type === 'addresses',
          );

          if (activeAddressSubIndex > -1) {
            activeSubscriptions[clientId].splice(activeAddressSubIndex);
          }

          activeSubscriptions[clientId].push({
            type: 'addresses',
            id: data.id,
          });
        }

        const message = prepareMessage(data.id, clientId, { subscribed: true });

        ws.send(message);

        break;
      }

      case MESSAGES.UNSUBSCRIBE_ADDRESS: {
        const activeAddressSubIndex = activeSubscriptions[clientId].findIndex(
          index => index.type === 'addresses',
        );

        if (activeAddressSubIndex > -1) {
          activeSubscriptions[clientId].splice(activeAddressSubIndex);
        }

        const message = prepareMessage(data.id, clientId, {
          subscribed: false,
        });

        ws.send(message);
        addressesSubscribed[clientId] = [];

        break;
      }

      case MESSAGES.PUSH_TRANSACTION: {
        const submitTransactionMessage = await submitTransaction(
          data.id,
          clientId,
          data.params.txData,
        );

        ws.send(submitTransactionMessage);
        break;
      }

      default: {
        const message = prepareErrorMessage(
          data.id,
          `Unknown message id: ${data.command}`,
          clientId,
        );

        ws.send(message);
      }
    }
  });

  ws.on('pong', () => {
    logger.debug(`[${clientId}] Received pong from client.`);
    heartbeat(ws);
  });

  ws.on('error', error => {
    const message = prepareErrorMessage(-1, clientId, error);

    logger.warn(`[${clientId}] Received error ${JSON.stringify(message)}.`);
    ws.send(message);
  });

  ws.on('close', (code, reason) => {
    logger.info(`[${clientId}] Client disconnected. Code: ${code}, reason: ${reason}`);

    // remove subscriptions on close
    clients.splice(
      clients.findIndex(c => c.clientId === clientId),
      1,
    );
    delete activeSubscriptions[clientId];
    delete addressesSubscribed[clientId];
  });
});

server.listen(port, () => {
  logger.info(`✨✨✨ Server started - http://localhost:${port} ✨✨✨`);
});

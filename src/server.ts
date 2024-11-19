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
import { WELCOME_MESSAGE, REPOSITORY_URL } from './constants/index.js';
import {
  getMessage,
  prepareErrorMessage,
  prepareMessage,
  validators,
  MessageError,
} from './utils/message.js';
import { MetricsCollector } from './utils/prometheus.js';
import { SubscribedAddress, events, onBlock, startEmitter } from './events.js';
import getServerInfo from './methods/get-server-info.js';
import getAccountInfo from './methods/get-account-info.js';
import getAccountUtxo from './methods/get-account-utxo.js';
import getAdaHandle from './methods/get-ada-handle.js';
import getBlock from './methods/get-block.js';
import getProtocolParameters from './methods/get-protocols-parameters.js';
import getTransaction from './methods/get-transaction.js';
import submitTransaction from './methods/push-transaction.js';
import estimateFee from './methods/estimate-fee.js';
import getBalanceHistory from './methods/get-balance-history.js';
import { logger } from './utils/logger.js';
import { METRICS_COLLECTOR_INTERVAL_MS } from './constants/config.js';
import { getPort } from './utils/server.js';

import { createRequire } from 'module';
import { AffectedAddressesInBlock } from './types/events.js';
import { MessageId, Messages } from './types/message.js';

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
const addressesSubscribed: Record<string, SubscribedAddress[]> = {};

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
events.on(
  'newBlock',
  async (latestBlock: Responses['block_content'], affectedAddresses: AffectedAddressesInBlock) => {
    logger.debug(`Running newBlock callback for ${clients.length} clients`);
    try {
      for (const client of clients) {
        client.newBlockCallback(latestBlock, affectedAddresses);
      }
    } catch (error) {
      logger.error(
        `Failed to notify client about new block ${latestBlock.hash} ${latestBlock.height}.`,
        error,
      );
    }
  },
);

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
  const onMessage = async (data: Messages) => {
    const { command, id, params } = data;
    let response: string;

    logger.debug(
      `[${clientId}] RECV MSG ID ${id} "${command}" with params: ${JSON.stringify(params)}`,
    );

    switch (command) {
      case 'GET_BLOCK': {
        validators.GET_BLOCK(params);
        response = await getBlock(id, clientId, params.hashOrNumber);

        break;
      }

      case 'GET_ACCOUNT_UTXO': {
        validators.GET_ACCOUNT_UTXO(params);
        response = await getAccountUtxo(id, clientId, params.descriptor);

        break;
      }

      case 'ESTIMATE_FEE': {
        response = await estimateFee(id, clientId);

        break;
      }

      case 'GET_ACCOUNT_INFO': {
        validators.GET_ACCOUNT_INFO(params);
        response = await getAccountInfo(
          id,
          clientId,
          params.descriptor,
          params.details,
          params.page,
          params.pageSize,
        );

        break;
      }

      case 'GET_ADA_HANDLE': {
        validators.GET_ADA_HANDLE(params);
        response = await getAdaHandle(id, clientId, params.name);

        break;
      }

      case 'GET_BALANCE_HISTORY': {
        validators.GET_BALANCE_HISTORY(params);
        response = await getBalanceHistory(
          id,
          clientId,
          params.descriptor,
          params.groupBy,
          params.from,
          params.to,
        );

        break;
      }

      case 'GET_PROTOCOL_PARAMETERS': {
        response = await getProtocolParameters(id, clientId);

        break;
      }

      case 'GET_SERVER_INFO': {
        response = await getServerInfo(id, clientId);

        break;
      }

      case 'GET_TRANSACTION': {
        validators.GET_TRANSACTION(params);
        response = await getTransaction(id, clientId, params.txId, params.cbor);

        break;
      }

      case 'PUSH_TRANSACTION': {
        validators.PUSH_TRANSACTION(params);
        response = await submitTransaction(id, clientId, params.txData);

        break;
      }

      case 'SUBSCRIBE_BLOCK': {
        const activeBlockSubIndex = activeSubscriptions[clientId].findIndex(
          index => index.type === 'block',
        );

        if (activeBlockSubIndex > -1) {
          activeSubscriptions[clientId].splice(activeBlockSubIndex);
        }

        activeSubscriptions[clientId].push({ id, type: 'block' });

        response = prepareMessage({ id, clientId, data: { subscribed: true } });

        break;
      }

      case 'UNSUBSCRIBE_BLOCK': {
        const activeBlockSubIndex = activeSubscriptions[clientId].findIndex(
          index => index.type === 'block',
        );

        if (activeBlockSubIndex > -1) {
          activeSubscriptions[clientId].splice(activeBlockSubIndex);
        }

        response = prepareMessage({ id, clientId, data: { subscribed: false } });

        break;
      }

      case 'SUBSCRIBE_ADDRESS': {
        validators.SUBSCRIBE_ADDRESS(params);
        const { addresses, cbor } = params;

        if (addresses && addresses.length > 0) {
          for (const address of addresses) {
            const subscriptionIndex = addressesSubscribed[clientId].findIndex(
              addr => addr.address === address,
            );

            // Subscribe to new address...
            if (subscriptionIndex === -1) {
              addressesSubscribed[clientId].push({ address, cbor });
            }
            // ... or update the cbor option
            else {
              addressesSubscribed[clientId][subscriptionIndex].cbor ||= cbor;
            }
          }

          const activeAddressSubIndex = activeSubscriptions[clientId].findIndex(
            index => index.type === 'addresses',
          );

          if (activeAddressSubIndex > -1) {
            activeSubscriptions[clientId].splice(activeAddressSubIndex);
          }

          activeSubscriptions[clientId].push({ id, type: 'addresses' });
        }

        response = prepareMessage({ id, clientId, data: { subscribed: true } });

        break;
      }

      case 'UNSUBSCRIBE_ADDRESS': {
        const activeAddressSubIndex = activeSubscriptions[clientId].findIndex(
          index => index.type === 'addresses',
        );

        if (activeAddressSubIndex > -1) {
          activeSubscriptions[clientId].splice(activeAddressSubIndex);
        }

        response = prepareMessage({ id, clientId, data: { subscribed: false } });

        addressesSubscribed[clientId] = [];

        break;
      }

      default: {
        response = prepareErrorMessage(id, clientId, `Unknown command: ${command}`);
      }
    }

    ws.send(response);
  };

  const handleError = (id: MessageId, error: unknown) => {
    if (!(error instanceof MessageError)) {
      logger.error(error);
    }

    const response = prepareErrorMessage(id, clientId, error);

    ws.send(response);
  };

  ws.on('message', (message: string) => {
    try {
      const data = getMessage(message);

      onMessage(data).catch(error => handleError(data.id, error));
    } catch (error) {
      handleError(-1, error);
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

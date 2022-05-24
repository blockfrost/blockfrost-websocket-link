import express from 'express';
import http from 'http';
import WebSocket from 'ws';
import dotenv from 'dotenv';
dotenv.config();
import { Responses } from '@blockfrost/blockfrost-js';
import * as Sentry from '@sentry/node';
import * as Tracing from '@sentry/tracing';
import { CaptureConsole } from '@sentry/integrations';
import { v4 as uuidv4 } from 'uuid';
import packageJson from '../package.json';
import * as Server from './types/server';
import { MESSAGES, WELCOME_MESSAGE, REPOSITORY_URL } from './constants';
import { getMessage, prepareErrorMessage, prepareMessage } from './utils/message';
import { MetricsCollector } from './utils/prometheus';
import { events, onBlock, startEmitter } from './events';
import getServerInfo from './methods/get-server-info';
import getAccountInfo from './methods/get-account-info';
import getAccountUtxo from './methods/get-account-utxo';
import getBlock from './methods/get-block';
import getTransaction from './methods/get-transaction';
import submitTransaction from './methods/push-transaction';
import estimateFee from './methods/estimate-fee';
import getBalanceHistory from './methods/get-balance-history';
import { getAffectedAddresses } from './utils/address';
import { logger } from './utils/logger';
import { METRICS_COLLECTOR_INTERVAL_MS } from './constants/config';

const app = express();

if (process.env.BLOCKFROST_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.BLOCKFROST_SENTRY_DSN,
    release: `websocket-link@${packageJson.version}`,
    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
      new Tracing.Integrations.Express({ app }),
      new CaptureConsole({
        levels: ['error'],
      }),
    ],
    tracesSampleRate: 0.5,
  });
}

const port = process.env.PORT || 3005;
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

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

// eslint-disable-next-line @typescript-eslint/no-empty-function
function noop() {}

// ping all clients every 30s to keep connection alive
setInterval(() => {
  for (const w of wss.clients) {
    const ws = w as Server.Ws;

    if (ws.isAlive === false) {
      logger.debug(`Terminating stale connection for client ${ws.uid}.`);
      ws.terminate();
      continue;
    }

    ws.isAlive = false;
    logger.debug(`Sending ping for client ${ws.uid}`);
    ws.ping(noop);
  }
}, 30_000);

startEmitter();
// this event is triggered with every new block see events.ts
events.on('newBlock', async (latestBlock: Responses['block_content']) => {
  logger.info(
    `Retrieving affected addressed for newBlock ${latestBlock.hash} ${latestBlock.height}`,
  );
  const affectedAddresses = await getAffectedAddresses(latestBlock.height);

  logger.debug(`Running newBlock callback for ${clients.length} clients`);
  for (const client of clients) client.newBlockCallback(latestBlock, affectedAddresses);
});

wss.on('connection', (ws: Server.Ws) => {
  ws.isAlive = true;
  // generate unique client ID and set callbacks
  const clientId = uuidv4();

  ws.uid = clientId;
  logger.info(`Client ${clientId} connected`);
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

  if (!process.env.BLOCKFROST_PROJECT_ID) {
    const message = prepareErrorMessage(
      -1,
      `Missing PROJECT_ID env variable see: ${REPOSITORY_URL}`,
    );

    ws.send(message);
    return;
  }

  if (!process.env.BLOCKFROST_NETWORK) {
    const message = prepareErrorMessage(-1, `Missing NETWORK env variable see: ${REPOSITORY_URL}`);

    ws.send(message);
    return;
  }

  // general messages

  ws.on('message', async (message: string) => {
    const data = getMessage(message);

    if (!data) {
      const message = prepareErrorMessage(-1, 'Cannot parse the message');

      logger.debug(`Received invalid message from client ${clientId}`);
      ws.send(message);
      return;
    }
    logger.debug(
      `RECV MSG ID ${data.id} "${
        data?.command
      }" from client ${clientId} with params: ${JSON.stringify(data.params)}`,
    );

    switch (data.command) {
      case MESSAGES.GET_SERVER_INFO: {
        const message = await getServerInfo(data.id);

        ws.send(message);
        break;
      }

      case MESSAGES.GET_TRANSACTION: {
        const message = await getTransaction(data.id, data.params.txId);

        ws.send(message);
        break;
      }

      case MESSAGES.GET_BLOCK: {
        const message = await getBlock(data.id, data.params.hashOrNumber);

        ws.send(message);
        break;
      }

      case MESSAGES.GET_ACCOUNT_UTXO: {
        const message = await getAccountUtxo(data.id, data.params.descriptor);

        ws.send(message);
        break;
      }

      case MESSAGES.ESTIMATE_FEE: {
        const message = await estimateFee(data.id);

        ws.send(message);
        break;
      }

      case MESSAGES.GET_ACCOUNT_INFO: {
        const message = await getAccountInfo(
          data.id,
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

        const message = prepareMessage(data.id, { subscribed: true });

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

        const message = prepareMessage(data.id, {
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

        const message = prepareMessage(data.id, { subscribed: true });

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

        const message = prepareMessage(data.id, {
          subscribed: false,
        });

        ws.send(message);
        addressesSubscribed[clientId] = [];

        break;
      }

      case MESSAGES.PUSH_TRANSACTION: {
        const submitTransactionMessage = await submitTransaction(data.id, data.params.txData);

        ws.send(submitTransactionMessage);
        break;
      }

      default: {
        const message = prepareErrorMessage(data.id, `Unknown message id: ${data.command}`);

        ws.send(message);
      }
    }
  });

  ws.on('pong', () => {
    logger.debug(`Received pong from client ${clientId}`);
    heartbeat(ws);
  });

  ws.on('error', error => {
    const message = prepareErrorMessage(-1, error);

    logger.warn(`Received error ${JSON.stringify(message)} for client ${clientId}.`);
    ws.send(message);
  });

  ws.on('close', (code, reason) => {
    logger.info(`Client ${clientId} disconnected. Code: ${code}, reason: ${reason}`);

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

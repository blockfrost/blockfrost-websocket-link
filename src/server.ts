import express from 'express';
import http from 'http';
import WebSocket from 'ws';
import dotenv from 'dotenv';
import { Responses } from '@blockfrost/blockfrost-js';
import * as Sentry from '@sentry/node';
import * as Tracing from '@sentry/tracing';
import packageJson from '../package.json';
import * as Server from './types/server';
import { MESSAGES, WELCOME_MESSAGE, REPOSITORY_URL } from './constants';
import { getMessage, prepareErrorMessage, prepareMessage } from './utils/message';
import { getBlockTransactionsByAddresses } from './utils/transaction';
import { jsonToPrometheus } from './utils/prometheus';

import { events } from './events';
import getServerInfo from './methods/getServerInfo';
import getAccountInfo from './methods/getAccountInfo';
import getAccountUtxo from './methods/getAccountUtxo';
import getBlock from './methods/getBlock';
import getTransaction from './methods/getTransaction';
import submitTransaction from './methods/pushTransaction';
import estimateFee from './methods/estimateFee';
import getBalanceHistory from './methods/getBalanceHistory';

dotenv.config();

const app = express();

Sentry.init({
  dsn: 'https://19ef87c9068a4a78b7a53e4c57b6677f@o508102.ingest.sentry.io/5889476',
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Tracing.Integrations.Express({ app }),
  ],
  tracesSampleRate: 0.5,
});

const port = process.env.PORT || 3005;
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

server.keepAliveTimeout = 65000;

let subscribeBlockInterval: NodeJS.Timeout;

// index route
app.get('/', (_req, res) => {
  res.send(WELCOME_MESSAGE);
});

// status route
app.get('/status', (_req, res) => {
  res.send({
    status: 'ok',
    version: packageJson.version,
  });
});

// metrics route
app.get('/metrics', (_req, res) => {
  const metrics = {
    websocket_link_clients: wss.clients.size,
  };
  res.setHeader('Content-Type', 'text/plain');
  res.send(jsonToPrometheus(metrics));
});

const heartbeat = (ws: Server.Ws) => {
  ws.isAlive = true;
};

// eslint-disable-next-line @typescript-eslint/no-empty-function
function noop() {}

const interval = setInterval(() => {
  wss.clients.forEach(w => {
    const ws = w as Server.Ws;
    if (ws.isAlive === false) {
      return ws.terminate();
    }

    ws.isAlive = false;
    ws.ping(noop);
  });
}, 60000);

wss.on('connection', (ws: Server.Ws) => {
  let activeSubscriptions: Server.Subscription[] = [];
  let addressedSubscribed: string[] = [];

  ws.isAlive = true;

  ws.on('pong', () => {
    heartbeat(ws);
  });

  if (!process.env.PROJECT_ID) {
    const message = prepareErrorMessage(
      -1,
      `Missing PROJECT_ID env variable see: ${REPOSITORY_URL}`,
    );

    ws.send(message);
    return;
  }

  ws.on('error', error => {
    const message = prepareErrorMessage(-1, error);
    ws.send(message);
  });

  // this event is triggered with every new block see events.ts
  events.on('newBlock', async (latestBlock: Responses['block_content']) => {
    // block subscriptions
    const activeBlockSub = activeSubscriptions.find(i => i.type === 'block');

    if (activeBlockSub) {
      const message = prepareMessage(activeBlockSub.id, latestBlock);

      ws.send(message);
    }

    // address subscriptions
    const activeAddressesSubIndex = activeSubscriptions.findIndex(i => i.type === 'addresses');
    const activeAddressSub = activeSubscriptions[activeAddressesSubIndex];

    if (activeAddressSub && activeAddressSub.type === 'addresses') {
      const tsxInBlock = await getBlockTransactionsByAddresses(latestBlock, addressedSubscribed);

      // do not send empty notification
      if (tsxInBlock.length > 0) {
        const message = prepareMessage(activeAddressSub.id, tsxInBlock);

        ws.send(message);
      }
    }
  });

  // general messages

  ws.on('message', async (message: string) => {
    const data = getMessage(message);

    if (!data) {
      const message = prepareErrorMessage(-1, 'Cannot parse the message');
      ws.send(message);
      return;
    }

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
          data.params.from,
          data.params.to,
          data.params.groupBy,
        );

        ws.send(message);
        break;
      }

      case MESSAGES.SUBSCRIBE_BLOCK: {
        const activeBlockSubIndex = activeSubscriptions.findIndex(i => i.type === 'block');

        if (activeBlockSubIndex > -1) {
          activeSubscriptions.splice(activeBlockSubIndex);
        }

        activeSubscriptions.push({
          type: 'block',
          id: data.id,
        });

        const message = prepareMessage(data.id, { subscribed: true });
        ws.send(message);

        break;
      }

      case MESSAGES.UNSUBSCRIBE_BLOCK: {
        const activeBlockSubIndex = activeSubscriptions.findIndex(i => i.type === 'block');

        if (activeBlockSubIndex > -1) {
          const message = prepareMessage(data.id, {
            subscribed: false,
          });

          ws.send(message);
          activeSubscriptions.splice(activeBlockSubIndex);
        }

        break;
      }

      case MESSAGES.SUBSCRIBE_ADDRESS: {
        if (data.params.addresses && data.params.addresses.length > 0) {
          data.params.addresses.map(addressInput => {
            if (!addressedSubscribed.includes(addressInput)) {
              addressedSubscribed.push(addressInput);
            }
          });

          const activeAddressSubIndex = activeSubscriptions.findIndex(i => i.type === 'addresses');

          if (activeAddressSubIndex > -1) {
            activeSubscriptions.splice(activeAddressSubIndex);
          }

          activeSubscriptions.push({
            type: 'addresses',
            id: data.id,
          });

          const message = prepareMessage(data.id, { subscribed: true });

          ws.send(message);
        }

        break;
      }

      case MESSAGES.UNSUBSCRIBE_ADDRESS: {
        const activeAddressSubIndex = activeSubscriptions.findIndex(i => i.type === 'addresses');

        if (activeAddressSubIndex > -1) {
          const message = prepareMessage(data.id, {
            subscribed: false,
          });

          ws.send(message);
          addressedSubscribed = [];
          activeSubscriptions.splice(activeAddressSubIndex);
        }

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

  ws.on('close', () => {
    // clear intervals on close
    clearInterval(interval);
    clearInterval(subscribeBlockInterval);

    // remove subscriptions on close
    activeSubscriptions = [];
    addressedSubscribed = [];
  });
});

server.listen(port, () => {
  console.log(`✨✨✨ Server started - http://localhost:${port} ✨✨✨`);
});

import express from 'express';
import http from 'http';
import WebSocket from 'ws';
import childProcess from 'child_process';
import dotenv from 'dotenv';
import { Responses } from '@blockfrost/blockfrost-js';
import packageJson from '../package.json';
import * as Server from './types/server';
import { MESSAGES, MESSAGES_RESPONSE, WELCOME_MESSAGE, REPOSITORY_URL } from './constants';
import { getMessage, prepareErrorMessage } from './utils/message';

import { events } from './events';
import getServerInfo from './methods/getServerInfo';
import getAccountInfo from './methods/getAccountInfo';
import getAccountUtxo from './methods/getAccountUtxo';
import getBlock from './methods/getBlock';
import getTransaction from './methods/getTransaction';
import submitTransaction from './methods/pushTransaction';

dotenv.config();

const app = express();
const port = process.env.PORT || 3005;
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
let subscribeBlockInterval: NodeJS.Timeout;

app.get('/', (_req, res) => {
  res.send(WELCOME_MESSAGE);
});

app.get('/status', (_req, res) => {
  res.send({
    status: 'ok',
    version: packageJson.version,
    commit: childProcess.execSync('git rev-parse HEAD').toString().trim(),
  });
});

const heartbeat = (ws: Server.Ws) => {
  ws.isAlive = true;
};

// eslint-disable-next-line @typescript-eslint/no-empty-function
const ping = () => {};

wss.on('connection', (ws: Server.Ws) => {
  let subscriptionBlockActive = false;
  let subscriptionAddressActive = false;
  let subscriptionAccountActive = false;

  ws.isAlive = true;

  ws.on('pong', () => {
    heartbeat(ws);
  });

  if (!process.env.PROJECT_ID) {
    const message = prepareErrorMessage(
      0,
      'server',
      `Missing PROJECT_ID env variable see: ${REPOSITORY_URL}`,
    );

    ws.send(message);
    return;
  }

  ws.on('error', error => {
    const message = prepareErrorMessage(1, MESSAGES.ERROR, error);
    ws.send(message);
  });

  events.on('LATEST_BLOCK', (block: Responses['block_content']) => {
    if (subscriptionBlockActive) {
      ws.emit(MESSAGES_RESPONSE.LATEST_BLOCK, block);
    }

    if (subscriptionAccountActive) {
      console.log('subscriptionAccountActive');
    }

    if (subscriptionAddressActive) {
      console.log('subscriptionAddressActive');
    }
  });

  ws.on('message', async (message: string) => {
    const data = getMessage(message);

    if (!data) {
      const message = prepareErrorMessage(1, MESSAGES.ERROR, 'Cannot parse the message');
      ws.send(message);
      return;
    }

    switch (data.command) {
      case MESSAGES.GET_SERVER_INFO: {
        const serverInfoMessage = await getServerInfo(data.id);
        ws.send(serverInfoMessage);
        break;
      }

      case MESSAGES.GET_TRANSACTION: {
        const txMessage = await getTransaction(data.id, data.params.txId);
        ws.send(txMessage);
        break;
      }

      case MESSAGES.GET_BLOCK: {
        const blockHashMessage = await getBlock(data.id, data.params.hashOrNumber);
        ws.send(blockHashMessage);
        break;
      }

      case MESSAGES.GET_ACCOUNT_UTXO: {
        const accountUtxoMessage = await getAccountUtxo(data.id, data.params.descriptor);
        ws.send(accountUtxoMessage);
        break;
      }

      case MESSAGES.GET_ACCOUNT_INFO: {
        const accountInfoMessage = await getAccountInfo(
          data.id,
          data.params.descriptor,
          data.params.details,
          data.params.page,
          data.params.pageSize,
        );
        ws.send(accountInfoMessage);
        break;
      }

      case MESSAGES.SUBSCRIBE_BLOCK: {
        subscriptionBlockActive = true;
        break;
      }

      case MESSAGES.SUBSCRIBE_ADDRESS: {
        subscriptionAddressActive = true;
        break;
      }

      case MESSAGES.SUBSCRIBE_ACCOUNT: {
        subscriptionAccountActive = true;
        break;
      }

      case MESSAGES.UNSUBSCRIBE_BLOCK: {
        subscriptionBlockActive = false;
        break;
      }

      case MESSAGES.UNSUBSCRIBE_ADDRESS: {
        subscriptionAddressActive = false;
        break;
      }

      case MESSAGES.UNSUBSCRIBE_ACCOUNT: {
        subscriptionAccountActive = false;
        break;
      }

      case MESSAGES.PUSH_TRANSACTION: {
        const submitTransactionMessage = await submitTransaction(data.id, data.params.txData);
        ws.send(submitTransactionMessage);
        break;
      }

      default: {
        const message = prepareErrorMessage(
          data.id,
          MESSAGES.ERROR,
          `Unknown message id: ${data.command}`,
        );
        ws.send(message);
      }
    }
  });
});

const interval = setInterval(() => {
  wss.clients.forEach(w => {
    const ws = w as Server.Ws;
    if (ws.isAlive === false) {
      return ws.terminate();
    }

    ws.isAlive = false;
    ws.ping(() => {
      ping();
    });
  });
}, 30000);

wss.on('close', () => {
  clearInterval(interval);
  clearInterval(subscribeBlockInterval);
});

server.listen(port, () => {
  console.log(`✨✨✨ Server started - http://localhost:${port} ✨✨✨`);
});

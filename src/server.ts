import express from 'express';
import http from 'http';
import WebSocket from 'ws';
import childProcess from 'child_process';
import dotenv from 'dotenv';
import { Responses } from '@blockfrost/blockfrost-js';
import packageJson from '../package.json';
import { Ws } from './types';
import { MESSAGES, WELCOME_MESSAGE, REPOSITORY_URL } from './constants';
import { getMessage, prepareMessage } from './utils/messages';
import { blockfrost } from './utils/blockfrostAPI';

import getServerInfo from './methods/getServerInfo';
import getAccountInfo from './methods/getAccountInfo';
import getAccountUtxo from './methods/getAccountUtxo';
import getTransaction from './methods/getTransaction';

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

const heartbeat = (ws: Ws) => {
  ws.isAlive = true;
};

// eslint-disable-next-line @typescript-eslint/no-empty-function
const ping = () => {};

wss.on('connection', (ws: Ws) => {
  let subscriptionBlockActive = false;
  ws.isAlive = true;

  ws.on('pong', () => {
    heartbeat(ws);
  });

  if (!process.env.PROJECT_ID) {
    const message = prepareMessage(
      0,
      MESSAGES.ERROR,
      `Missing PROJECT_ID env variable see: ${REPOSITORY_URL}`,
    );
    ws.send(message);
    return;
  }

  ws.on('error', error => {
    const message = prepareMessage(1, MESSAGES.ERROR, error);
    ws.send(message);
  });

  ws.on('message', async (message: string) => {
    const data = getMessage(message);

    if (!data) {
      const message = prepareMessage(1, MESSAGES.ERROR, 'Cannot parse the message');
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
        );
        ws.send(accountInfoMessage);
        break;
      }

      case MESSAGES.SUBSCRIBE_BLOCK: {
        if (subscriptionBlockActive) break;

        let latestSentBlock: null | Responses['block_content'] = null;
        subscribeBlockInterval = setInterval(async () => {
          subscriptionBlockActive = true;
          const latestBlock = await blockfrost.blocksLatest();

          if (!latestSentBlock || latestBlock.hash !== latestSentBlock.hash) {
            latestSentBlock = latestBlock;
            const message = prepareMessage(data.id, MESSAGES.LATEST_BLOCK, latestSentBlock);
            ws.send(message);
          }
        }, 1000);

        break;
      }

      case MESSAGES.UNSUBSCRIBE_BLOCK: {
        if (!subscriptionBlockActive) break;

        subscriptionBlockActive = false;
        clearInterval(subscribeBlockInterval);
        break;
      }

      default: {
        const message = prepareMessage(
          data.id,
          MESSAGES.ERROR,
          `Unknown message id: ${data.command}`,
        );
        ws.send(message);
      }
    }
  });

  const message = prepareMessage(1, MESSAGES.CONNECT, 'Connected to server');
  ws.send(message);
});

const interval = setInterval(() => {
  wss.clients.forEach(w => {
    const ws = w as Ws;
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

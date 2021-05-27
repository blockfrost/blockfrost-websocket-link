import express from 'express';
import http from 'http';
import WebSocket from 'ws';
import childProcess from 'child_process';
import dotenv from 'dotenv';
import { Responses } from '@blockfrost/blockfrost-js';
import packageJson from '../package.json';
import * as Server from './types/server';
import { MESSAGES, WELCOME_MESSAGE, MESSAGES_RESPONSE, REPOSITORY_URL } from './constants';
import { getMessage, prepareErrorMessage, prepareMessage } from './utils/message';
import { getBlockTransactionsByAddresses } from './utils/transaction';

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
const activeSubscriptions: Server.Subscription[] = [];

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
  ws.isAlive = true;

  ws.on('pong', () => {
    heartbeat(ws);
  });

  if (!process.env.PROJECT_ID) {
    const message = prepareErrorMessage(
      -1,
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

  events.on('block', async (latestBlock: Responses['block_content']) => {
    const activeBlockSub = activeSubscriptions.find(i => i.type === 'block');

    if (activeBlockSub) {
      const message = prepareMessage(
        activeBlockSub.id.toString(),
        MESSAGES_RESPONSE.BLOCK,
        latestBlock,
      );

      ws.send(message);
    }

    const activeAddressesSub = activeSubscriptions.find(i => i.type === 'addresses');

    if (activeAddressesSub && activeAddressesSub.type === 'addresses') {
      const tsxInBlock = await getBlockTransactionsByAddresses(
        latestBlock,
        activeAddressesSub.addresses,
      );

      const message = prepareMessage(
        activeAddressesSub.id.toString(),
        MESSAGES_RESPONSE.NOTIFICATION,
        tsxInBlock,
      );

      ws.send(message);
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
        const activeBlockSub = activeSubscriptions.find(i => i.type === 'block');

        if (!activeBlockSub) {
          activeSubscriptions.push({
            type: 'block',
            id: activeSubscriptions.length,
          });
        }

        break;
      }

      case MESSAGES.UNSUBSCRIBE_BLOCK: {
        const activeBlockSub = activeSubscriptions.find(i => i.type === 'block');

        if (activeBlockSub) {
          activeSubscriptions.splice(activeBlockSub.id);
        }

        break;
      }

      case MESSAGES.SUBSCRIBE_ADDRESSES: {
        if (data.params.addresses && data.params.addresses.length > 0) {
          const activeAddressSub = activeSubscriptions.find(i => i.type === 'addresses');

          if (!activeAddressSub) {
            activeSubscriptions.push({
              type: 'addresses',
              id: activeSubscriptions.length,
              addresses: data.params.addresses,
            });
          } else {
            if (activeAddressSub.type === 'addresses') {
              const activeAddresses = activeAddressSub.addresses;

              data.params.addresses.map(inputAddr => {
                if (!activeAddresses.includes(inputAddr)) {
                  activeAddressSub.addresses.push(inputAddr);
                }
              });
            }
          }
        }

        break;
      }

      case MESSAGES.UNSUBSCRIBE_ADDRESSES: {
        const activeAddressSub = activeSubscriptions.find(i => i.type === 'addresses');

        if (activeAddressSub) {
          activeSubscriptions.splice(activeAddressSub.id);
        }

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

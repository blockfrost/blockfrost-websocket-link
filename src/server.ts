import express from 'express';
import http from 'http';
import WebSocket from 'ws';
import { BlockFrostAPI } from '@blockfrost/blockfrost-js';
import { Ws } from 'types';
import { MESSAGES } from './constants';
import { getParams, prepareMessage } from './utils';

import getServerInfo from './methods/getServerInfo';
import getAccountInfo from './methods/getAccountInfo';

const app = express();
const port = process.env.PORT || 3005;
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const welcomeMessage =
  'Hello there! I am a websocket-link server see: <a href="https://github.com/blockfrost/websocket-link">https://github.com/blockfrost/websocket-link</a>';

app.get('/', (_req, res) => {
  res.send(welcomeMessage);
});

const heartbeat = (ws: Ws) => {
  ws.isAlive = true;
};

// eslint-disable-next-line @typescript-eslint/no-empty-function
const ping = () => {};

wss.on('connection', (ws: Ws) => {
  ws.isAlive = true;

  ws.on('pong', () => {
    heartbeat(ws);
  });

  const blockFrostApi = new BlockFrostAPI({ projectId: 'cIeLBZLcKvpDwGNX3Sa6BFtjrRHSwAl1' });

  ws.on('error', error => {
    const message = prepareMessage(MESSAGES.ERROR, error);
    ws.send(message);
  });

  ws.on('message', async (message: string) => {
    const { command, params } = getParams(message);

    switch (command) {
      case MESSAGES.GET_SERVER_INFO: {
        const serverInfo = await getServerInfo(blockFrostApi);
        const message = prepareMessage(MESSAGES.GET_SERVER_INFO, serverInfo);
        ws.send(message);
        break;
      }

      case MESSAGES.GET_ACCOUNT_INFO: {
        if (!params || !params.descriptor) {
          const message = prepareMessage(MESSAGES.GET_ACCOUNT_INFO, 'Missing param descriptor');
          ws.send(message);
          break;
        }

        const accountInfo = await getAccountInfo(blockFrostApi, params.descriptor);
        const message = prepareMessage(MESSAGES.GET_ACCOUNT_INFO, accountInfo);
        ws.send(message);
        break;
      }

      default: {
        const message = prepareMessage(MESSAGES.ERROR, `Unknown message ID ${command}`);
        ws.send(message);
      }
    }
  });
  ws.send('Connected to server');
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

wss.on('close', function close() {
  clearInterval(interval);
});

server.listen(port, () => {
  console.log(`✨✨✨ Server started - http://localhost:${port} ✨✨✨`);
});

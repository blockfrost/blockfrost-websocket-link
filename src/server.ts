import express from 'express';
import http from 'http';
import WebSocket from 'ws';
import { BlockFrostAPI } from '@blockfrost/blockfrost-js';
import { Ws, Message } from 'types';
import { MESSAGES } from './constants/messages';
import { prepareMessage } from './utils';

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

wss.on('connection', (ws: Ws) => {
  const blockFrostApi = new BlockFrostAPI({ projectId: 'G8CaeClBRTr5CiUxCLzgGeqGoVbwuaZs' });

  ws.on('error', error => {
    const message = prepareMessage(MESSAGES.ERROR, error);
    ws.send(message);
  });

  ws.on('message', async (message: string) => {
    try {
      const parsedMessage: Message = JSON.parse(message);
      const { name, params } = parsedMessage;

      switch (name) {
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
          const message = prepareMessage(MESSAGES.ERROR, `Unknown message ID ${name}`);
          ws.send(message);
        }
      }
    } catch (err) {
      console.log(err);
      const message = prepareMessage(MESSAGES.ERROR, `Unknown message ID`);
      ws.send(message);
    }
  });

  ws.send('Connected to server');
});

server.listen(port, () => {
  console.log(`✨✨✨ Server started - http://localhost:${port} ✨✨✨`);
});

import express from 'express';
import http from 'http';
import WebSocket from 'ws';

import { Ws } from 'types';

const app = express();
const port = process.env.PORT || 3005;
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const welcomeMessage =
  'Hello there! I am a websocket-link server see: <a href="https://blockfrost.io">https://blockfrost.io</a>';

const MESSAGES = {
  GET_SERVER_INFO: 'GET_SERVER_INFO',
  GET_ACCOUNT_UTXO: 'GET_ACCOUNT_UTXO',
  SUBSCRIBE_BLOCK: 'SUBSCRIBE_BLOCK',
  PUSH_TRANSACTION: 'PUSH_TRANSACTION',
};

app.get('/', (_req, res) => {
  res.send(welcomeMessage);
});

wss.on('connection', (ws: Ws) => {
  ws.isAlive = true;

  ws.on('message', (message: string) => {
    switch (message) {
      case MESSAGES.GET_SERVER_INFO:
        {
          ws.send({
            message: MESSAGES.GET_SERVER_INFO,
            payload: 'GET_SERVER_INFO',
          });
        }
        break;
      case MESSAGES.GET_ACCOUNT_UTXO:
        ws.send({
          message: MESSAGES.GET_ACCOUNT_UTXO,
          payload: 'GET_ACCOUNT_UTXO',
        });
        break;
      case MESSAGES.PUSH_TRANSACTION:
        ws.send({
          message: MESSAGES.PUSH_TRANSACTION,
          payload: 'PUSH_TRANSACTION',
        });
        break;
      case MESSAGES.SUBSCRIBE_BLOCK: {
        setInterval(() => {
          ws.send(Date.now());
        }, 500);
        break;
      }
      default: {
        ws.send('Unknown message ID');
      }
    }
  });

  ws.send(welcomeMessage);
});

server.listen(port, () => {
  console.log(`✨✨✨ Server started - http://localhost:${port} ✨✨✨`);
});

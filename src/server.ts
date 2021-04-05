import express from 'express';
import http from 'http';
import WebSocket from 'ws';
import dotenv from 'dotenv';
import { BlockFrostAPI } from '@blockfrost/blockfrost-js';
import { Ws } from './types';
import { MESSAGES, WELCOME_MESSAGE, REPOSITORY_URL } from './constants';
import { getParams, prepareMessage } from './utils';

import getServerInfo from './methods/getServerInfo';
import getAccountInfo from './methods/getAccountInfo';

dotenv.config();
const app = express();
const port = process.env.PORT || 3005;
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.get('/', (_req, res) => {
    res.send(WELCOME_MESSAGE);
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

    try {
        if (!process.env.PROJECT_ID) {
            const message = prepareMessage(
                0,
                MESSAGES.ERROR,
                `Missing PROJECT_ID env variable see: ${REPOSITORY_URL}`,
            );
            ws.send(message);
            return;
        }

        const blockFrostApi = new BlockFrostAPI({
            projectId: process.env.PROJECT_ID,
            customBackend: process.env.BACKEND_URL,
        });

        ws.on('error', error => {
            const message = prepareMessage(1, MESSAGES.ERROR, error);
            ws.send(message);
        });

        ws.on('message', async (message: string) => {
            const data = getParams(message);

            switch (data.command) {
                case MESSAGES.GET_SERVER_INFO: {
                    const serverInfo = await getServerInfo(blockFrostApi);
                    const message = prepareMessage(data.id, MESSAGES.GET_SERVER_INFO, serverInfo);

                    ws.send(message);
                    break;
                }

                case MESSAGES.GET_ACCOUNT_INFO: {
                    if (!data.params.descriptor) {
                        const message = prepareMessage(
                            data.id,
                            MESSAGES.GET_ACCOUNT_INFO,
                            'Missing param descriptor',
                        );

                        ws.send(message);
                        break;
                    }

                    try {
                        const accountInfo = await getAccountInfo(
                            blockFrostApi,
                            data.params.descriptor,
                        );
                        const message = prepareMessage(
                            data.id,
                            MESSAGES.GET_ACCOUNT_INFO,
                            accountInfo,
                        );

                        ws.send(message);
                    } catch (err) {
                        const message = prepareMessage(data.id, MESSAGES.GET_ACCOUNT_INFO, 'Error');

                        ws.send(message);
                    }
                    break;
                }
                default: {
                    const message = prepareMessage(
                        data.id,
                        MESSAGES.ERROR,
                        `Unknown message ID ${data.command}`,
                    );

                    ws.send(message);
                }
            }
        });
    } catch (err) {
        console.log(err);
    }

    const message = prepareMessage(2, MESSAGES.CONNECT, 'Connected to server');
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

wss.on('close', function close() {
    clearInterval(interval);
});

server.listen(port, () => {
    console.log(`✨✨✨ Server started - http://localhost:${port} ✨✨✨`);
});
